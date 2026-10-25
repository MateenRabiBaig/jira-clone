const express = require('express');
const attachmentController = require('../controllers/attachmentController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Uploads always require auth; downloads use optional auth so public
// files (avatars) work in <img> tags while task files stay protected.
router.post('/', protect, attachmentController.upload.single('file'), attachmentController.uploadAttachment);
router.get('/:id', optionalAuth, attachmentController.getAttachment);
router.delete('/:id', protect, attachmentController.deleteAttachment);

module.exports = router;
