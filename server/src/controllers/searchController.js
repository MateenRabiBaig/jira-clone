const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (value) => value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * GET /api/search?q=
 * Searches the projects and tasks the user can access, plus users by
 * name/email (results only include safe fields, for member invites).
 */
const globalSearch = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) {
    return res.json({ projects: [], tasks: [], users: [] });
  }
  const regex = new RegExp(escapeRegex(q), 'i');

  const [projects, tasks, users] = await Promise.all([
    Project.find({ members: req.user._id, $or: [{ name: regex }, { key: regex }] })
      .select('name key description')
      .limit(5),
    Task.find({ title: regex, project: { $in: await Project.find({ members: req.user._id }).distinct('_id') } })
      .select('title ticketKey status project')
      .populate('project', 'name')
      .limit(5),
    User.find({ $or: [{ name: regex }, { email: regex }] })
      .select('name email avatarUrl')
      .limit(5),
  ]);

  res.json({ projects, tasks, users });
});

module.exports = { globalSearch };
