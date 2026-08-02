const express = require('express');
const {
  createProject, getMyProjects, getProjectById, addMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createProject);
router.get('/', getMyProjects);
router.get('/:id', getProjectById);
router.post('/:id/members', addMember);

module.exports = router
