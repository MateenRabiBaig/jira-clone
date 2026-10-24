const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')
const taskRoutes = require('./routes/taskRoutes')
const commentRoutes = require('./routes/commentRoutes')
const userRoutes = require('./routes/userRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')

const app = express()

const normalizeOrigin = (origin) => origin.trim().replace(/\/$/, '')
const configuredClient = normalizeOrigin(process.env.CLIENT_URL || 'http://localhost:5173')
const allowedOrigins = new Set([configuredClient, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://127.0.0.1:4173'])
const isAllowedOrigin = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin)
  const isLocalOrigin = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(normalizedOrigin)
  return isLocalOrigin || allowedOrigins.has(normalizedOrigin)
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests and the local Vite/preview origins.
    if (!origin || isAllowedOrigin(origin)) return callback(null, true)
    return callback(new Error('Origin not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') return next()

  const origin = req.get('Origin')
  if (!origin || !isAllowedOrigin(origin)) return next()

  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(', '))
  res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '))
  res.setHeader('Vary', 'Origin')
  return res.sendStatus(204)
})

app.use(cors(corsOptions))
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use('/api/health', (req, res) => res.json({ status: 'ok', build: 'ecf375a' }))
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))

module.exports = app
