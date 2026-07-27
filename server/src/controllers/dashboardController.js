const Project = require('../models/Project');
const Task = require('../models/Task');

const getStats = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id }).select('_id')
    const projectIds = projects.map((p) => p._id)

    const [tasksCount, completedCount, pendingCount] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'done' }),
      Task.countDocuments({ project: { $in: projectIds }, status: { $ne: 'done' } })
    ])

    res.json({ projectsCount: projects.length, tasksCount, completedCount, pendingCount })
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getRecentTasks = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id }).select('_id')
    const projectIds = projects.map((p) => p._id)

    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name')
      .populate('assignee', 'name')
      .sort({ updatedAt: -1 })
      .limit(5)

    res.json(tasks)
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getStats, getRecentTasks }