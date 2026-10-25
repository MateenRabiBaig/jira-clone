const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const getNotifications = asyncHandler(async (req, res) => {
  const { unread, page = 1, limit = 20 } = req.query;
  const filter = { user: req.user._id };
  if (unread === 'true') filter.read = false;

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('actor', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    Notification.countDocuments({ user: req.user._id }),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);

  res.json({ notifications, total, unreadCount, page: pageNumber, pages: Math.ceil(total / pageSize) || 1 });
});

const unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ count });
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) throw new ApiError(404, 'Notification not found');
  notification.read = true;
  await notification.save();
  res.json(notification);
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
  res.json({ message: 'All notifications marked as read' });
});

module.exports = { getNotifications, unreadCount, markRead, markAllRead };
