const Comment = require('../models/Comment')
const Task = require('../models/Task')
const User = require('../models/User')
const asyncHandler = require('../utils/asyncHandler')
const { getTaskForMember } = require('../utils/access')
const { notifyUsers, extractMentions } = require('../utils/notifications')

const COMMENT_POPULATE = { path: 'author', select: 'name email avatarUrl' }

const addComment = asyncHandler(async (req, res) => {
    const { text, taskId } = req.body
    const task = await getTaskForMember(taskId, req.user._id)

    const comment = await Comment.create({ text, task: task._id, author: req.user._id })
    const populated = await comment.populate(COMMENT_POPULATE)

    // Mentioned project members take precedence for comment notifications.
    const taskWithProject = await Task.findById(task._id).populate('project', 'members')
    const memberDocs = await User.find({ _id: { $in: taskWithProject.project.members } }).select('name email')
    const mentioned = extractMentions(text, memberDocs)

    if (mentioned.length > 0) {
        notifyUsers({
            recipients: mentioned.map((m) => m._id),
            actorId: req.user._id,
            type: 'mention',
            message: `${req.user.name} mentioned you on "${task.title}"`,
            refs: { task: task._id, project: task.project },
        })
    } else {
        notifyUsers({
            recipients: [task.assignee, task.reporter],
            actorId: req.user._id,
            type: 'comment',
            message: `${req.user.name} commented on "${task.title}"`,
            refs: { task: task._id, project: task.project },
        })
    }

    res.status(201).json(populated)
})

const getCommentsByTask = asyncHandler(async (req, res) => {
    await getTaskForMember(req.params.taskId, req.user._id)
    const comments = await Comment.find({ task: req.params.taskId }).populate(COMMENT_POPULATE).sort({ createdAt: 1 })
    res.json(comments)
})

module.exports = { addComment, getCommentsByTask }
