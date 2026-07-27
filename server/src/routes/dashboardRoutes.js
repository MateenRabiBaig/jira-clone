const express = require('express');
const { getStats, getRecentTasks } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.get('/stats', getStats);
router.get('/recent-tasks', getRecentTasks);

module.exports = router;