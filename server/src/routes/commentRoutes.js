const express = require('express')
const { addComment, getCommentsByTask } = require('../controllers/commentController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()
router.use(protect)

router.post('/', addComment)
router.post('/task/:taskId', getCommentsByTask)

module.exports = router