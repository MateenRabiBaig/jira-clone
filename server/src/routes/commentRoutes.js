const express = require('express')
const { addComment, getCommentByTask } = require('../controllers/commentController')
const { project } = require('../middleware/authMiddleware')

const router = express.Router()
router.use(protect)

router.post('/', addComment)
router.post('/task/:taskId', getCommentByTask)

module.exports = router