const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const storage = require('../utils/storage');
const { getProjectForMember, isMember, isOwner } = require('../utils/access');
const { notifyUsers } = require('../utils/notifications');

/** Derives a short uppercase key from the project name, e.g. "Mobile App" -> "MA". */
const deriveKey = (name) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words.map((w) => w[0]).join('');
  const base = (words.length > 1 ? initials : name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3))
    .toUpperCase()
    .padEnd(2, 'X');
  return base.slice(0, 6) || 'PRJ';
};

/** Finds a globally unique project key by appending a counter when needed. */
const generateUniqueKey = async (name) => {
  const base = deriveKey(name);
  let candidate = base;
  let counter = 1;
  while (await Project.exists({ key: candidate })) {
    counter += 1;
    candidate = `${base}${counter}`;
  }
  return candidate;
};

const ensureProjectKey = async (project) => {
  if (project.key) return;
  project.key = await generateUniqueKey(project.name);
  await project.save();
};

const createProject = asyncHandler(async (req, res) => {
  const { name, description, team } = req.body;
  const key = await generateUniqueKey(name);
  const project = await Project.create({
    name,
    description,
    key,
    owner: req.user._id,
    members: [req.user._id],
    team: team || null,
  });
  res.status(201).json(project);
});

const getMyProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ members: req.user._id })
    .populate('owner', 'name email avatarUrl')
    .populate('members', 'name email avatarUrl')
    .populate('team', 'name')
    .sort({ updatedAt: -1 });
  res.json(projects);
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email avatarUrl')
    .populate('members', 'name email avatarUrl')
    .populate('team', 'name');
  if (!project || !isMember(project, req.user._id)) {
    // Same response for missing and forbidden, so ids cannot be probed.
    throw new ApiError(404, 'Project not found');
  }
  res.json(project);
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await getProjectForMember(req.params.id, req.user._id);
  if (!isOwner(project, req.user._id)) throw new ApiError(403, 'Only the project owner can edit the project');

  const { name, description } = req.body;
  if (name !== undefined) {
    project.name = name;
    if (!project.key) project.key = await generateUniqueKey(name);
  }
  if (description !== undefined) project.description = description;
  await project.save();

  const updated = await Project.findById(project._id)
    .populate('owner', 'name email avatarUrl')
    .populate('members', 'name email avatarUrl')
    .populate('team', 'name');
  res.json(updated);
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await getProjectForMember(req.params.id, req.user._id);
  if (!isOwner(project, req.user._id)) throw new ApiError(403, 'Only the project owner can delete the project');

  const taskIds = await Task.find({ project: project._id }).distinct('_id');
  const tasks = await Task.find({ project: project._id }).select('attachments');
  for (const task of tasks) {
    for (const attachment of task.attachments || []) await storage.deleteFile(attachment.fileId);
  }
  await Comment.deleteMany({ task: { $in: taskIds } });
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ message: 'Project deleted' });
});

const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const project = await getProjectForMember(req.params.id, req.user._id);
  if (!isOwner(project, req.user._id)) throw new ApiError(403, 'Only the project owner can add members');

  const user = await User.findById(userId).select('name email avatarUrl');
  if (!user) throw new ApiError(404, 'User not found');
  if (isMember(project, userId)) throw new ApiError(409, 'That user is already a project member');

  project.members.push(user._id);
  await project.save();

  notifyUsers({
    recipients: [user._id],
    actorId: req.user._id,
    type: 'added-to-project',
    message: `${req.user.name} added you to project "${project.name}"`,
    refs: { project: project._id },
  });

  const updated = await Project.findById(project._id)
    .populate('owner', 'name email avatarUrl')
    .populate('members', 'name email avatarUrl')
    .populate('team', 'name');
  res.json(updated);
});

const removeMember = asyncHandler(async (req, res) => {
  const project = await getProjectForMember(req.params.id, req.user._id);
  if (!isOwner(project, req.user._id)) throw new ApiError(403, 'Only the project owner can remove members');
  const { userId } = req.params;

  if (isOwner(project, userId)) throw new ApiError(400, 'The project owner cannot be removed');
  if (!isMember(project, userId)) throw new ApiError(404, 'That user is not a project member');

  project.members = project.members.filter((m) => m.toString() !== userId);
  await project.save();
  await Task.updateMany({ project: project._id, assignee: userId }, { $set: { assignee: null } });

  const updated = await Project.findById(project._id)
    .populate('owner', 'name email avatarUrl')
    .populate('members', 'name email avatarUrl')
    .populate('team', 'name');
  res.json(updated);
});

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  ensureProjectKey,
};
