const Task = require('../models/Task');

const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, project, assignee } = req.body;
    if (!title || !project) return res.status(400).json({ message: 'Title and project are required' });

    const task = await Task.create({ title, description, priority, dueDate, project, assignee });
    const populated = await task.populate('assignee', 'name email');
    res.status(201).json(populated);
  }
  catch(err) {
    res.status(500).json({ message: err.message });
  }
}

const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  }
  catch(err) {
    res.status(500).json({ message: err.message });
  }
}

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
      .populate('assignee', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  }
  catch(err) {
    res.status(500).json({ message: err.message });
  }
}

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('assignee', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  }
  catch(err) {
    res.status(500).json({ message: err.message });
  }
}

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  }
  catch(err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createTask, getTasksByProject, updateTask, updateTaskStatus, deleteTask }