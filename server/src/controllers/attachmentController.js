const mongoose = require('mongoose');
const multer = require('multer');
const Task = require('../models/Task');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const storage = require('../utils/storage');
const { getProjectForMember, assertObjectId, isOwner } = require('../utils/access');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: storage.MAX_FILE_SIZE },
});

const filesCollection = () => mongoose.connection.db.collection(`${storage.BUCKET}.files`);

const uploadAttachment = asyncHandler(async (req, res) => {
  const { taskId } = req.body;
  assertObjectId(taskId, 'task id');
  const task = await Task.findById(taskId).populate('project', 'owner members');
  if (!task) throw new ApiError(404, 'Task not found');
  await getProjectForMember(task.project._id, req.user._id);
  storage.validateFile(req.file);

  const stored = await storage.putFile(req.file);
  task.attachments.push({
    fileId: stored.fileId,
    filename: req.file.originalname,
    mimeType: req.file.mimetype,
    size: stored.size,
    uploadedBy: req.user._id,
  });
  await task.save();
  const attachment = task.attachments[task.attachments.length - 1];
  res.status(201).json({ attachment, attachments: task.attachments });
});

/**
 * Streams a stored file. Files flagged public (avatars) are served to
 * anyone; task attachments require auth plus project membership.
 */
const getAttachment = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, 'attachment id');
  const file = await filesCollection().findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
  if (!file) throw new ApiError(404, 'File not found');

  if (!file.metadata?.isPublic) {
    if (!req.user) throw new ApiError(401, 'Not authorized');
    const task = await Task.findOne({ 'attachments.fileId': file._id }).select('project');
    if (!task) throw new ApiError(404, 'File not found');
    await getProjectForMember(task.project, req.user._id);
  }

  res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `inline; filename="${file.metadata?.originalName || file.filename}"`);
  res.setHeader('Cache-Control', file.metadata?.isPublic ? 'public, max-age=86400' : 'private, no-store');
  storage.openDownload(req.params.id).pipe(res);
});

const deleteAttachment = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, 'attachment id');
  const task = await Task.findOne({ 'attachments.fileId': req.params.id }).populate('project', 'owner members');
  if (!task) throw new ApiError(404, 'Attachment not found');
  await getProjectForMember(task.project._id, req.user._id);

  const attachment = task.attachments.find((a) => a.fileId.toString() === req.params.id);
  const canDelete =
    (attachment?.uploadedBy && attachment.uploadedBy.toString() === req.user._id.toString()) ||
    isOwner(task.project, req.user._id);
  if (!canDelete) throw new ApiError(403, 'Only the uploader or the project owner can remove this attachment');

  await storage.deleteFile(req.params.id);
  task.attachments = task.attachments.filter((a) => a.fileId.toString() !== req.params.id);
  await task.save();
  res.json({ attachments: task.attachments });
});

/** Uploads a profile avatar (public file) and links it to the user. */
const uploadAvatar = asyncHandler(async (req, res) => {
  storage.validateFile(req.file);
  if (!/^image\//.test(req.file.mimetype)) throw new ApiError(400, 'Avatar must be an image');

  const stored = await storage.putFile(req.file);
  await filesCollection().updateOne(
    { _id: stored.fileId },
    { $set: { 'metadata.isPublic': true, 'metadata.avatarFor': req.user._id } }
  );

  const previous = req.user.avatarUrl;
  const avatarUrl = `/api/attachments/${stored.fileId}`;
  await User.findByIdAndUpdate(req.user._id, { avatarUrl });
  if (previous?.startsWith('/api/attachments/')) await storage.deleteFile(previous.split('/').pop());

  res.json({ avatarUrl });
});

module.exports = { upload, uploadAttachment, getAttachment, deleteAttachment, uploadAvatar };
