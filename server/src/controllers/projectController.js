const project = require('../models/Project')

const createProject = async(req, res) => {
    try {
        const { name, description } = req.body;
        if(!name) return res.status(400).json({ message: 'Project name is required' })
        
        const project = await Project.create({ name, description, owner: req.user._id, members: [req.user._id] });
        res.status(201).json(project)
  }
  catch(err) {
    res.status(500).json({ message: err.message })
  }
}

const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id }).populate('owner', 'name email').populate('members', 'name email').sort({ updatedAt: -1 })
    res.json(projects);
  }
  catch(err) {
    res.status(500).json({ message: err.message })
  }
}

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, members: req.user._id }).populate('owner', 'name email').populate('members', 'name email')

    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  }
  catch(err) {
    res.status(500).json({ message: err.message })
  }
}

const updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { $set: req.body }, { new: true })
    if (!project) return res.status(404).json({ message: 'Project not found or not owner' })
    res.json(project)
  }
  catch(err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    if (!project) return res.status(404).json({ message: 'Project not found or not owner' })
    res.json({ message: 'Project deleted' })
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { $addToSet: { members: userId } }, { new: true }).populate('members', 'name email')
    if (!project) return res.status(404).json({ message: 'Project not found or not owner' })
    res.json(project)
  }
  catch(err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { createProject, getMyProjects, getProjectById, updateProject, deleteProject, addMember }