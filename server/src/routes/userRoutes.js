const express = require('express')
const { searchUserByEmail, searchUsers, getPublicProfile } = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')
const { validate } = require('../middleware/validate')
const { param } = require('express-validator')

const router = express.Router()
router.use(protect)

router.get('/search', searchUserByEmail)
router.get('/search-users', searchUsers)
router.get('/:id', [param('id').isMongoId().withMessage('Invalid user id')], validate, getPublicProfile)

module.exports = router
