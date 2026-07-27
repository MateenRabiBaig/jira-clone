const User = require('../models/User')
const user = require('../models/User')

const searchUserByEmail = async(req, res) => {
    try {
        const { email } = req.query
        if(!email) return res.status(400).json({ message: 'Email is required' })

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('name email _id')
        if(!user) return res.status(404).json({ message: 'No user found with that email' })
        res.json(user)
    }
    catch(err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { searchUserByEmail }