const express = require('express');
const {
  createProject, getMyProjects, getProjectById, updateProject, deleteProject, addMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createProject);
router.get('/', getMyProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);

module.exports = router