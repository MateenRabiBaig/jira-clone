const express = require('express')
const { searchUserByEmail } = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()
router.use(protect)

router.get('/search', searchUserByEmail)

module.exports = router