const express = require('express');
const { body, param } = require('express-validator');
const {
  createProject, getMyProjects, getProjectById, updateProject, deleteProject, addMember, removeMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

const idRule = param('id').isMongoId().withMessage('Invalid project id');
const userIdRule = param('userId').isMongoId().withMessage('Invalid user id');

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 80 }).withMessage('Name is too long'),
    body('description').optional().isLength({ max: 600 }).withMessage('Description is too long'),
    body('team').optional({ nullable: true }).isMongoId().withMessage('Invalid team id'),
  ],
  validate,
  createProject
);
router.get('/', getMyProjects);
router.get('/:id', idRule, validate, getProjectById);
router.patch(
  '/:id',
  idRule,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 80 }).withMessage('Name is too long'),
    body('description').optional().isLength({ max: 600 }).withMessage('Description is too long'),
  ],
  validate,
  updateProject
);
router.delete('/:id', idRule, validate, deleteProject);
router.post('/:id/members', idRule, [body('userId').isMongoId().withMessage('Invalid user id')], validate, addMember);
router.delete('/:id/members/:userId', idRule, userIdRule, validate, removeMember);

module.exports = router
