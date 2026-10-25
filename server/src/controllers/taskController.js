const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getProjectForMember, isMember, isOwner } = require('../utils/access');
const { notifyUsers } = require('../utils/notifications');
const storage = require('../utils/storage');

const TASK_POPULATE = [
  { path: 'assignee', select: 'name email avatarUrl' },
  { path: 'reporter', select: 'name email avatarUrl' },
];

const labelFor = (value) => {
  if (value === null || value === undefined || value === '') return 'None';
  if (typeof value === 'string') return value;
  if (value.name) return value.name;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
};

/** Pushes an activity entry onto the task log. */
const logActivity = (task, userId, action, field, from, to) => {
  task.activity = task.activity || [];
  task.activity.push({ user: userId, action, field, from, to, createdAt: new Date() });
};

/** Atomically reserves the next ticket number for a project and returns the key. */
const nextTicketKey = async (projectId) => {
  const project = await Project.findById(projectId).select('key name taskSeq');
  if (!project) throw new ApiError(404, 'Project not found');
  if (!project.key) {
    // Heal legacy projects that were created before keys existed.
    const { ensureProjectKey } = require('./projectController');
    await ensureProjectKey(project);
  }
  const updated = await Project.findOneAndUpdate(
    { _id: projectId },
    { $inc: { taskSeq: 1 } },
    { new: true }
  ).select('key taskSeq');
  return `${updated.key}-${updated.taskSeq}`;
};

const validateMemberRef = async (userId, project) => {
  if (!userId) return null;
  if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, 'Invalid user reference');
  const member = await User.findById(userId).select('name email');
  if (!member || !isMember(project, userId)) {
    throw new ApiError(400, 'Assigned user must be a project member');
  }
  return member;
};

const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, project: projectId, assignee, workType, status, labels } = req.body;
  const project = await getProjectForMember(projectId, req.user._id);
  if (assignee) await validateMemberRef(assignee, project);

  const ticketKey = await nextTicketKey(project._id);
  const task = await Task.create({
    title,
    description,
    priority,
    dueDate: dueDate || null,
    project: project._id,
    assignee: assignee || null,
    workType,
    status,
    labels: Array.isArray(labels) ? labels : [],
    reporter: req.user._id,
    ticketKey,
    activity: [{ user: req.user._id, action: 'created', createdAt: new Date() }],
  });

  if (task.assignee) {
    notifyUsers({
      recipients: [task.assignee],
      actorId: req.user._id,
      type: 'task-assigned',
      message: `${req.user.name} assigned you "${task.title}" in ${project.name}`,
      refs: { task: task._id, project: project._id },
    });
  }

  const populated = await Task.findById(task._id).populate(TASK_POPULATE);
  res.status(201).json(populated);
});

const getTasksByProject = asyncHandler(async (req, res) => {
  const project = await getProjectForMember(req.params.projectId, req.user._id);
  const tasks = await Task.find({ project: project._id })
    .populate(TASK_POPULATE)
    .sort({ createdAt: -1 });
  res.json(tasks);
});

/**
 * GET /api/tasks/my-tasks?status=&priority=&project=&q=&sort=&page=&limit=
 * Tasks assigned to (or reported by, with ?role=reporter) the current user.
 */
const getMyTasks = asyncHandler(async (req, res) => {
  const { status, priority, project, q, sort = 'updated', page = 1, limit = 50, role = 'assignee' } = req.query;

  const memberProjects = await Project.find({ members: req.user._id }).distinct('_id');
  const filter = { project: { $in: memberProjects } };
  if (role === 'reporter') filter.reporter = req.user._id;
  else filter.assignee = req.user._id;

  if (status) filter.status = String(status);
  if (priority) filter.priority = String(priority);
  if (project && mongoose.isValidObjectId(project)) filter.project = project;
  if (q) {
    const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: regex }, { ticketKey: regex }];
  }

  const sortOptions = {
    updated: { updatedAt: -1 },
    created: { createdAt: -1 },
    due: { dueDate: 1, updatedAt: -1 },
    priority: { priority: -1, updatedAt: -1 },
  }[sort] || { updatedAt: -1 };

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate(TASK_POPULATE)
      .populate('project', 'name key')
      .sort(sortOptions)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    Task.countDocuments(filter),
  ]);

  res.json({ tasks, total, page: pageNumber, pages: Math.ceil(total / pageSize) || 1 });
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate(TASK_POPULATE)
    .populate('activity.user', 'name email avatarUrl');
  if (!task) throw new ApiError(404, 'Task not found');
  const project = await getProjectForMember(task.project, req.user._id);
  const json = task.toJSON();
  res.json({ ...json, project: { id: project.id, name: project.name, key: project.key } });
});

/** PATCH /api/tasks/:id - partial update with activity logging + notifications. */
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  const project = await getProjectForMember(task.project, req.user._id);

  const allowed = ['title', 'description', 'status', 'priority', 'workType', 'dueDate', 'labels', 'assignee', 'reporter'];
  const changes = [];
  const notifications = [];

  for (const field of allowed) {
    if (!(field in req.body)) continue;
    let value = req.body[field];

    if (field === 'assignee' || field === 'reporter') {
      if (value === null || value === '') {
        if (field === 'reporter') throw new ApiError(400, 'Reporter is required');
        value = null;
      } else {
        await validateMemberRef(value, project);
      }
    }
    if (field === 'dueDate') value = value || null;
    if (field === 'labels') {
      if (!Array.isArray(value)) throw new ApiError(400, 'Labels must be a list');
      value = value.map((l) => String(l).trim()).filter(Boolean).slice(0, 10);
    }
    if (field === 'title' && !String(value).trim()) throw new ApiError(400, 'Title cannot be empty');

    const previous = task[field];
    const changed =
      JSON.stringify(previous instanceof Date ? previous.toISOString() : previous ?? null) !==
      JSON.stringify(value instanceof Date ? value.toISOString() : value ?? null);
    if (!changed) continue;

    // Notify the new assignee / reporter when they are being assigned.
    if ((field === 'assignee' || field === 'reporter') && value) {
      notifications.push({
        recipients: [value],
        type: 'task-assigned',
        message: `${req.user.name} made you ${field} of "${task.title}"`,
      });
    }
    if (field === 'status') {
      notifications.push({
        recipients: [task.assignee, task.reporter],
        type: 'status-change',
        message: `${req.user.name} moved "${task.title}" to ${labelFor(value)}`,
      });
    }

    logActivity(task, req.user._id, 'updated', field, labelFor(previous), labelFor(value));
    task[field] = value;
    changes.push(field);
  }

  if (changes.length === 0) {
    const populated = await Task.findById(task._id).populate(TASK_POPULATE);
    return res.json(populated);
  }

  await task.save();
  for (const n of notifications) {
    notifyUsers({ recipients: n.recipients, actorId: req.user._id, type: n.type, message: n.message, refs: { task: task._id, project: project._id } });
  }

  const populated = await Task.findById(task._id).populate(TASK_POPULATE);
  res.json(populated);
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  const project = await getProjectForMember(task.project, req.user._id);

  if (task.status !== status) {
    logActivity(task, req.user._id, 'updated', 'status', labelFor(task.status), labelFor(status));
    task.status = status;
    await task.save();
    notifyUsers({
      recipients: [task.assignee, task.reporter],
      actorId: req.user._id,
      type: 'status-change',
      message: `${req.user.name} moved "${task.title}" to ${labelFor(status)}`,
      refs: { task: task._id, project: project._id },
    });
  }

  const populated = await Task.findById(task._id).populate(TASK_POPULATE);
  res.json(populated);
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  const project = await getProjectForMember(task.project, req.user._id);

  const canDelete =
    isOwner(project, req.user._id) || task.reporter.toString() === req.user._id.toString();
  if (!canDelete) throw new ApiError(403, 'Only the reporter or the project owner can delete this task');

  for (const attachment of task.attachments || []) await storage.deleteFile(attachment.fileId);
  await Comment.deleteMany({ task: task._id });
  await task.deleteOne();
  res.json({ message: 'Task deleted' });
});

module.exports = {
  createTask,
  getTasksByProject,
  getMyTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
