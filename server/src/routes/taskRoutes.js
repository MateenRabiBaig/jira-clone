const express = require('express');
const { body, param } = require('express-validator');
const {
  createTask, getTasksByProject, getMyTasks, getTaskById, updateTask, updateTaskStatus, deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();
router.use(protect);

const idRule = param('id').isMongoId().withMessage('Invalid task id');

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }).withMessage('Title is too long'),
    body('project').isMongoId().withMessage('A valid project is required'),
    body('status').optional().isIn(['todo', 'in-progress', 'in-review', 'done']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('workType').optional().isIn(['task', 'story', 'bug']).withMessage('Invalid work type'),
    body('assignee').optional({ nullable: true }).isMongoId().withMessage('Invalid assignee'),
    body('labels').optional().isArray().withMessage('Labels must be a list'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid due date').toDate(),
  ],
  validate,
  createTask
);
router.get('/my-tasks', getMyTasks);
router.get(
  '/project/:projectId',
  [param('projectId').isMongoId().withMessage('Invalid project id')],
  validate,
  getTasksByProject
);
router.get('/:id', idRule, validate, getTaskById);
router.patch(
  '/:id',
  idRule,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }).withMessage('Title is too long'),
    body('description').optional().isLength({ max: 10000 }).withMessage('Description is too long'),
    body('status').optional().isIn(['todo', 'in-progress', 'in-review', 'done']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('workType').optional().isIn(['task', 'story', 'bug']).withMessage('Invalid work type'),
    body('assignee').optional({ nullable: true }).isMongoId().withMessage('Invalid assignee'),
    body('reporter').optional().isMongoId().withMessage('Invalid reporter'),
    body('labels').optional().isArray().withMessage('Labels must be a list'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid due date').toDate(),
  ],
  validate,
  updateTask
);
router.patch(
  '/:id/status',
  idRule,
  [body('status').isIn(['todo', 'in-progress', 'in-review', 'done']).withMessage('Invalid status')],
  validate,
  updateTaskStatus
);
router.delete('/:id', idRule, validate, deleteTask);

module.exports = router
