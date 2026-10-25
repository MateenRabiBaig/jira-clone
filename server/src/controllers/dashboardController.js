const Project = require('../models/Project');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

const getStats = asyncHandler(async (req, res) => {
  const projects = await Project.find({ members: req.user._id }).select('_id');
  const projectIds = projects.map((p) => p._id);

  const [tasksCount, completedCount, pendingCount] = await Promise.all([
    Task.countDocuments({ project: { $in: projectIds } }),
    Task.countDocuments({ project: { $in: projectIds }, status: 'done' }),
    Task.countDocuments({ project: { $in: projectIds }, status: { $ne: 'done' } }),
  ]);

  res.json({ projectsCount: projects.length, tasksCount, completedCount, pendingCount });
});

const getRecentTasks = asyncHandler(async (req, res) => {
  const projects = await Project.find({ members: req.user._id }).select('_id');
  const projectIds = projects.map((p) => p._id);

  const tasks = await Task.find({ project: { $in: projectIds } })
    .populate('project', 'name key')
    .populate('assignee', 'name avatarUrl')
    .sort({ updatedAt: -1 })
    .limit(5);

  res.json(tasks);
});

module.exports = { getStats, getRecentTasks };
