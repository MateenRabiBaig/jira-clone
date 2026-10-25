const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const Team = require('../models/Team');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const storage = require('../utils/storage');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create({ name, email, password });
  res.status(201).json({ user, token: generateToken(user._id) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  user.password = undefined;
  res.json({ user, token: generateToken(user._id) });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, email, bio, notificationPrefs } = req.body;

  if (email && email !== req.user.email) {
    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, 'That email is already in use');
  }

  if (name !== undefined) req.user.name = name;
  if (email !== undefined) req.user.email = email;
  if (bio !== undefined) req.user.bio = bio;
  if (notificationPrefs !== undefined) {
    req.user.notificationPrefs = { ...req.user.notificationPrefs?.toObject?.(), ...notificationPrefs };
  }

  await req.user.save();
  res.json({ user: req.user });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
  res.json({ token: generateToken(user._id), message: 'Password updated' });
});

/**
 * Deletes the account and everything owned by it. Refuses when the user
 * still owns teams or projects that include other members, so deleting an
 * account can never destroy other people's workspace.
 */
const deleteMe = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(password))) {
    throw new ApiError(401, 'Password is incorrect');
  }

  const ownedProjects = await Project.find({ owner: req.user._id });
  const sharedOwnedProjects = ownedProjects.filter((p) => p.members.length > 1);
  if (sharedOwnedProjects.length > 0) {
    throw new ApiError(
      409,
      `You still own ${sharedOwnedProjects.length} project(s) with other members. Delete or remove the members first.`
    );
  }

  const ownedTeams = await Team.find({ owner: req.user._id });
  const sharedOwnedTeams = ownedTeams.filter((t) => t.members.length > 1);
  if (sharedOwnedTeams.length > 0) {
    throw new ApiError(
      409,
      `You still own ${sharedOwnedTeams.length} team(s) with other members. Delete or remove the members first.`
    );
  }

  for (const team of ownedTeams) {
    await Project.updateMany({ team: team._id }, { $set: { team: null } });
    await team.deleteOne();
  }
  for (const project of ownedProjects) {
    const tasks = await Task.find({ project: project._id }).select('attachments');
    for (const task of tasks) {
      for (const attachment of task.attachments || []) await storage.deleteFile(attachment.fileId);
    }
    await Comment.deleteMany({ task: { $in: await Task.find({ project: project._id }).distinct('_id') } });
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
  }

  // Unassign from other people's tasks; hand reporting over to that project's owner.
  const assignedTasks = await Task.find({ assignee: req.user._id });
  for (const task of assignedTasks) {
    task.assignee = null;
    await task.save();
  }
  const reportedTasks = await Task.find({ reporter: req.user._id });
  for (const task of reportedTasks) {
    const project = await Project.findById(task.project);
    task.reporter = project ? project.owner : task.reporter;
    if (task.reporter.toString() === req.user._id.toString()) {
      await task.deleteOne();
      continue;
    }
    await task.save();
  }

  await Comment.deleteMany({ author: req.user._id });
  // Drop activity entries authored by the deleted user instead of leaving dangling refs.
  await Task.updateMany(
    { 'activity.user': req.user._id },
    { $pull: { activity: { user: req.user._id } } }
  );
  await Team.updateMany(
    {},
    { $pull: { members: { user: req.user._id }, invites: { user: req.user._id } } }
  );
  await Project.updateMany({ members: req.user._id }, { $pull: { members: req.user._id } });
  await Notification.deleteMany({ user: req.user._id });
  await req.user.deleteOne();

  res.json({ message: 'Account deleted' });
});

module.exports = { register, login, getMe, updateMe, changePassword, deleteMe };
