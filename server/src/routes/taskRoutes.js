const express = require('express');
const { createTask, getTasksByProject, updateTaskStatus } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.post('/', createTask);
router.get('/project/:projectId', getTasksByProject);
router.patch('/:id/status', updateTaskStatus);

module.exports = router
