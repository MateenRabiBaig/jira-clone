const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')
const taskRoutes = require('./routes/taskRoutes')

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)

app.use('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))

module.exports = app