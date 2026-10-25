const express = require('express')
const { body } = require('express-validator')
const { register, login, getMe, updateMe, changePassword, deleteMe } = require('../controllers/authController')
const attachmentController = require('../controllers/attachmentController')
const { protect } = require('../middleware/authMiddleware')
const { validate } = require('../middleware/validate')
const { authLimiter, sensitiveActionLimiter } = require('../middleware/rateLimiters')

const router = express.Router()

const emailRule = body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail()
const passwordRule = body('password')
  .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')

router.post('/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }).withMessage('Name is too long'),
    emailRule.withMessage('Enter a valid email address'),
    passwordRule,
  ],
  validate,
  register
)

router.post('/login', authLimiter, [emailRule, body('password').notEmpty().withMessage('Password is required')], validate, login)

router.get('/me', protect, getMe)

router.patch('/me',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 80 }).withMessage('Name is too long'),
    body('email').optional().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
    body('bio').optional().isLength({ max: 400 }).withMessage('Bio must be 400 characters or fewer'),
    body('notificationPrefs').optional().isObject().withMessage('Invalid notification preferences'),
  ],
  validate,
  updateMe
)

router.patch('/password',
  protect,
  sensitiveActionLimiter,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  changePassword
)

router.delete('/me', protect, sensitiveActionLimiter, [body('password').notEmpty().withMessage('Password is required')], validate, deleteMe)

router.post('/avatar', protect, attachmentController.upload.single('file'), attachmentController.uploadAvatar)

module.exports = router
