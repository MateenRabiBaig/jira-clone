const express = require('express');
const { getNotifications, unreadCount, markRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { param } = require('express-validator');

const router = express.Router();
router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', unreadCount);
router.post('/read-all', markAllRead);
router.patch('/:id/read', [param('id').isMongoId().withMessage('Invalid notification id')], validate, markRead);

module.exports = router;
