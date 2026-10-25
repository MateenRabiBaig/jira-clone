const express = require('express');
const { body, param } = require('express-validator');
const {
  createTeam, getMyTeams, getMyInvitations, getTeamById, updateTeam, deleteTeam,
  inviteMember, respondToInvite, removeMember, updateMemberRole, leaveTeam,
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();
router.use(protect);

const idRule = param('id').isMongoId().withMessage('Invalid team id');

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Team name is required').isLength({ max: 80 }).withMessage('Name is too long'),
    body('description').optional().isLength({ max: 400 }).withMessage('Description is too long'),
  ],
  validate,
  createTeam
);
router.get('/', getMyTeams);
router.get('/invitations', getMyInvitations);
router.get('/:id', idRule, validate, getTeamById);
router.patch(
  '/:id',
  idRule,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 80 }).withMessage('Name is too long'),
    body('description').optional().isLength({ max: 400 }).withMessage('Description is too long'),
  ],
  validate,
  updateTeam
);
router.delete('/:id', idRule, validate, deleteTeam);
router.post(
  '/:id/invites',
  idRule,
  [
    body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
    body('role').optional().isIn(['admin', 'member']).withMessage('Role must be admin or member'),
  ],
  validate,
  inviteMember
);
router.post(
  '/:id/invites/:inviteId/respond',
  idRule,
  [param('inviteId').isMongoId().withMessage('Invalid invitation id'), body('action').isIn(['accept', 'decline']).withMessage('Invalid action')],
  validate,
  respondToInvite
);
router.delete('/:id/members/:userId', idRule, [param('userId').isMongoId().withMessage('Invalid user id')], validate, removeMember);
router.patch(
  '/:id/members/:userId',
  idRule,
  [param('userId').isMongoId().withMessage('Invalid user id'), body('role').isIn(['admin', 'member']).withMessage('Role must be admin or member')],
  validate,
  updateMemberRole
);
router.post('/:id/leave', idRule, validate, leaveTeam);

module.exports = router;
