const Notification = require('../models/Notification');

/**
 * Creates notifications for a set of recipients, skipping the actor and
 * users who have disabled that notification category. Never throws -
 * notification failures must not break the main operation.
 */
const notifyUsers = async ({ recipients, actorId, type, message, refs = {} }) => {
  try {
    const unique = [...new Set(recipients.filter(Boolean).map((r) => r.toString()))]
      .filter((id) => id !== actorId.toString());
    if (unique.length === 0) return;

    const User = require('../models/User');
    const prefKey = {
      'task-assigned': 'assignedTasks',
      comment: 'comments',
      mention: 'mentions',
      'status-change': 'statusChanges',
      'team-invite': 'invitations',
      'added-to-project': 'invitations',
    }[type];

    const users = await User.find({ _id: { $in: unique } }).select('notificationPrefs');
    const allowed = new Set(
      users
        .filter((u) => !prefKey || u.notificationPrefs?.[prefKey] !== false)
        .map((u) => u._id.toString())
    );

    const docs = unique
      .filter((id) => allowed.has(id))
      .map((userId) => ({ user: userId, actor: actorId, type, message, ...refs }));
    if (docs.length > 0) await Notification.insertMany(docs);
  } catch (err) {
    console.error('[notifications] failed to create notifications:', err.message);
  }
};

/** Extracts @mentions (by full name or email) from text against a member list. */
const extractMentions = (text, members) => {
  if (!text || !text.includes('@')) return [];
  const lower = text.toLowerCase();
  return members.filter((m) => {
    if (!m.name && !m.email) return false;
    return lower.includes(`@${m.name.toLowerCase()}`) || lower.includes(`@${m.email.toLowerCase()}`);
  });
};

module.exports = { notifyUsers, extractMentions };
