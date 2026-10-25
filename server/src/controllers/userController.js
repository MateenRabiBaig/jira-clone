const User = require('../models/User')
const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')

/** Exact-email lookup kept for the project add-member flow. */
const searchUserByEmail = asyncHandler(async (req, res) => {
    const email = String(req.query.email || '').toLowerCase().trim()
    if (!email) throw new ApiError(400, 'Email is required')

    const user = await User.findOne({ email }).select('name email avatarUrl')
    if (!user) throw new ApiError(404, 'No user found with that email')
    res.json(user)
})

/**
 * Prefix search over name and email. Used by member pickers; only safe
 * fields are returned so this cannot be used to enumerate private data.
 */
const searchUsers = asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim()
    if (q.length < 2) return res.json([])
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    const users = await User.find({ $or: [{ name: regex }, { email: regex }] })
        .select('name email avatarUrl')
        .limit(8)
    res.json(users)
})

const getPublicProfile = asyncHandler(async (req, res) => {
    // Deliberately excludes email - only shared context (teams/projects) reveals it.
    const user = await User.findById(req.params.id).select('name bio avatarUrl')
    if (!user) throw new ApiError(404, 'User not found')
    res.json(user)
})

module.exports = { searchUserByEmail, searchUsers, getPublicProfile }
