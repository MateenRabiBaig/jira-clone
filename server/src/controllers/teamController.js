const Team = require('../models/Team');
const Project = require('../models/Project');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getTeamForMember, memberRole } = require('../utils/access');
const { notifyUsers } = require('../utils/notifications');

const TEAM_POPULATE = { path: 'members.user', select: 'name email avatarUrl' };

/** The requesting user's role in the team, with the implicit owner. */
const effectiveRole = (team, userId) => {
  if (team.owner.toString() === userId.toString()) return 'owner';
  return memberRole(team, userId);
};

const requireAdmin = (team, userId) => {
  const role = effectiveRole(team, userId);
  if (role !== 'owner' && role !== 'admin') {
    throw new ApiError(403, 'Only team owners and admins can do that');
  }
  return role;
};

const serializeTeam = (team) => {
  const json = team.toJSON();
  // Normalize members so the owner always appears once, first, as 'owner'.
  const members = json.members || [];
  const ownerEntry = members.find((m) => m.user?.id === team.owner.toString());
  const rest = members
    .filter((m) => m.user?.id !== team.owner.toString())
    .map((m) => ({ ...m, role: m.role === 'owner' ? 'admin' : m.role }));
  return {
    ...json,
    owner: team.owner.toString(),
    members: ownerEntry
      ? [{ ...ownerEntry, role: 'owner' }, ...rest]
      : [{ user: { id: team.owner.toString() }, role: 'owner' }, ...rest],
  };
};

const createTeam = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const team = await Team.create({
    name,
    description,
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'owner' }],
  });
  const populated = await Team.findById(team._id).populate(TEAM_POPULATE);
  res.status(201).json(serializeTeam(populated));
});

const getMyTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({ 'members.user': req.user._id })
    .populate(TEAM_POPULATE)
    .sort({ updatedAt: -1 });
  res.json(teams.map(serializeTeam));
});

/** Pending invitations for the current user (used by the Teams page). */
const getMyInvitations = asyncHandler(async (req, res) => {
  const teams = await Team.find({
    invites: { $elemMatch: { user: req.user._id } },
  })
    .populate('invites.invitedBy', 'name email')
    .select('name description invites');

  const invitations = [];
  for (const team of teams) {
    for (const invite of team.invites) {
      if (invite.user.toString() !== req.user._id.toString()) continue;
      invitations.push({
        id: invite._id,
        teamId: team._id,
        teamName: team.name,
        teamDescription: team.description,
        role: invite.role,
        invitedBy: invite.invitedBy,
        createdAt: invite.createdAt,
      });
    }
  }
  res.json(invitations);
});

const getTeamById = asyncHandler(async (req, res) => {
  const team = await getTeamForMember(req.params.id, req.user._id);
  const populated = await Team.findById(team._id)
    .populate(TEAM_POPULATE)
    .populate('invites.user', 'name email avatarUrl')
    .populate('invites.invitedBy', 'name email');
  const json = serializeTeam(populated);
  json.myRole = effectiveRole(team, req.user._id);
  json.projects = await Project.find({ team: team._id, members: req.user._id })
    .select('name key description owner members')
    .populate('owner', 'name email avatarUrl')
    .sort({ updatedAt: -1 });
  res.json(json);
});

const updateTeam = asyncHandler(async (req, res) => {
  const team = await getTeamForMember(req.params.id, req.user._id);
  requireAdmin(team, req.user._id);

  const { name, description } = req.body;
  if (name !== undefined) team.name = name;
  if (description !== undefined) team.description = description;
  await team.save();
  res.json(serializeTeam(await Team.findById(team._id).populate(TEAM_POPULATE)));
});

const deleteTeam = asyncHandler(async (req, res) => {
  const team = await getTeamForMember(req.params.id, req.user._id);
  if (team.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the team owner can delete the team');
  }
  await Project.updateMany({ team: team._id }, { $set: { team: null } });
  await team.deleteOne();
  res.json({ message: 'Team deleted' });
});

const inviteMember = asyncHandler(async (req, res) => {
  const team = await getTeamForMember(req.params.id, req.user._id);
  requireAdmin(team, req.user._id);

  const { email, role = 'member' } = req.body;
  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('name email');
  if (!user) throw new ApiError(404, 'No account found with that email. Ask them to sign up first.');

  if (team.members.some((m) => m.user.toString() === user._id.toString())) {
    throw new ApiError(409, `${user.name} is already a member of this team`);
  }
  if (team.invites.some((i) => i.user.toString() === user._id.toString())) {
    throw new ApiError(409, `${user.name} already has a pending invitation`);
  }

  team.invites.push({ user: user._id, email: normalizedEmail, role, invitedBy: req.user._id });
  await team.save();

  notifyUsers({
    recipients: [user._id],
    actorId: req.user._id,
    type: 'team-invite',
    message: `${req.user.name} invited you to join team "${team.name}"`,
    refs: { team: team._id },
  });

  res.status(201).json({
    message: `Invitation sent to ${user.email}`,
    invites: (await Team.findById(team._id).populate('invites.user', 'name email avatarUrl')).invites,
  });
});

const respondToInvite = asyncHandler(async (req, res) => {
  // Invitees are not members yet, so membership checks must not apply here.
  const team = await Team.findById(req.params.id);
  if (!team) throw new ApiError(404, 'Team not found');
  const { action } = req.body; // 'accept' | 'decline'
  const inviteIndex = team.invites.findIndex((i) => i._id.toString() === req.params.inviteId);
  if (inviteIndex === -1) throw new ApiError(404, 'Invitation not found');
  const invite = team.invites[inviteIndex];
  if (invite.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'This invitation is not yours');
  }

  team.invites.splice(inviteIndex, 1);
  if (action === 'accept') {
    team.members.push({ user: req.user._id, role: invite.role });
    await team.save();
    return res.json({ message: `You joined ${team.name}`, teamId: team._id });
  }
  await team.save();
  res.json({ message: 'Invitation declined' });
});

const removeMember = asyncHandler(async (req, res) => {
  const team = await getTeamForMember(req.params.id, req.user._id);
  const actorRole = effectiveRole(team, req.user._id);
  if (actorRole !== 'owner' && actorRole !== 'admin') {
    throw new ApiError(403, 'Only team owners and admins can remove members');
  }
  const { userId } = req.params;
  if (team.owner.toString() === userId.toString()) {
    throw new ApiError(400, 'The team owner cannot be removed');
  }
  const target = team.members.find((m) => m.user.toString() === userId.toString());
  if (!target) throw new ApiError(404, 'That user is not a team member');
  if (target.role === 'admin' && actorRole !== 'owner') {
    throw new ApiError(403, 'Only the team owner can remove an admin');
  }

  team.members = team.members.filter((m) => m.user.toString() !== userId.toString());
  await team.save();
  res.json({ message: 'Member removed' });
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const team = await getTeamForMember(req.params.id, req.user._id);
  if (team.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the team owner can change member roles');
  }
  const { role } = req.body;
  if (!['admin', 'member'].includes(role)) throw new ApiError(400, 'Role must be admin or member');

  const target = team.members.find((m) => m.user.toString() === req.params.userId);
  if (!target) throw new ApiError(404, 'That user is not a team member');
  if (target.user.toString() === team.owner.toString()) {
    throw new ApiError(400, 'The owner role cannot be changed');
  }

  target.role = role;
  await team.save();
  res.json({ message: 'Role updated' });
});

const leaveTeam = asyncHandler(async (req, res) => {
  const team = await getTeamForMember(req.params.id, req.user._id);
  if (team.owner.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'The owner cannot leave. Delete the team or transfer ownership instead.');
  }
  team.members = team.members.filter((m) => m.user.toString() !== req.user._id.toString());
  await team.save();
  res.json({ message: 'You left the team' });
});

module.exports = {
  createTeam,
  getMyTeams,
  getMyInvitations,
  getTeamById,
  updateTeam,
  deleteTeam,
  inviteMember,
  respondToInvite,
  removeMember,
  updateMemberRole,
  leaveTeam,
};
