const jwt = require('jsonwebtoken')
const User = require('../models/User')

const getUserFromToken = async (req) => {
    const authHeader = req.headers.authorization
    if(!authHeader?.startsWith('Bearer')) return null

    try {
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        return User.findById(decoded.id).select('-password')
    }
    catch {
        return null
    }
}

const protect = async(req, res, next) => {
    const user = await getUserFromToken(req)
    if(!user) return res.status(401).json({ message: 'Not authorized' })
    req.user = user
    next()
}

/** Attaches req.user when a valid token is present, but never rejects. */
const optionalAuth = async(req, _res, next) => {
    req.user = await getUserFromToken(req)
    next()
}

module.exports = { protect, optionalAuth }
