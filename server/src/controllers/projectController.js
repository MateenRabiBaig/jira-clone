const Project = require('../models/Project')
const User = require('../models/User')
const mongoose = require('mongoose')

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

const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User is required' })
    if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ message: 'Invalid user id' })

    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id })
    if (!project) return res.status(404).json({ message: 'Project not found or not owner' })

    const user = await User.findById(userId).select('name email')
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (project.members.some((member) => member.toString() === userId.toString())) {
      return res.status(409).json({ message: 'User is already a project member' })
    }

    project.members.push(user._id)
    await project.save()
    await project.populate('owner', 'name email')
    await project.populate('members', 'name email')
    res.json(project)
  }
  catch(err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { createProject, getMyProjects, getProjectById, addMember }
