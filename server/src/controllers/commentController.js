const Comment = require('../models/Comment')

const addComment = async(req, res) => {
    try {
        const { text, taskId } = req.body
        if(!text || taskId) return res.status(400).json({ message: 'text and textId required' })
        
        const comment = await Comment.create({ text, task: taskId, author: req.user._id })
        const populated = await comment.populate('author', 'name email')
        res.status(201).json(populated)
    }
    catch(err) {
        res.status(500).json({ message: err.message })
    }
}

const getCommentsByTask = async(req, res) => {
    try {
        const comments = await Comment.find({ task: req.params.taskId }).populate('author', 'name email').sort({ createdAt: 1 })
        res.json({ createdAt: 1 })
    }
    catch(err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { addComment, getCommentsByTask }