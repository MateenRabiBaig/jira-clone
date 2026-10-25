const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');
const crypto = require('crypto');
const ApiError = require('./ApiError');

const BUCKET = 'uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Extensions considered safe to serve to other project members.
const ALLOWED_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg',
  'pdf', 'txt', 'md', 'csv', 'json',
  'zip', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
]);

const getBucket = () => {
  if (!mongoose.connection.db) throw new ApiError(500, 'Database not ready');
  return new GridFSBucket(mongoose.connection.db, { bucketName: BUCKET });
};

const sanitizeFilename = (name) =>
  String(name || 'file').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);

const validateFile = (file) => {
  if (!file) throw new ApiError(400, 'No file provided');
  const extension = (file.originalname.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new ApiError(400, `File type ".${extension}" is not allowed`);
  }
  if (file.size > MAX_FILE_SIZE) throw new ApiError(400, 'File must be 5 MB or smaller');
};

/** Stores a buffer in GridFS and returns { fileId, filename, size }. */
const putFile = (file) => {
  const bucket = getBucket();
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${sanitizeFilename(file.originalname)}`;
  return new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(filename, {
      contentType: file.mimetype || 'application/octet-stream',
      metadata: { originalName: sanitizeFilename(file.originalname) },
    });
    stream.on('error', reject);
    stream.on('finish', () =>
      resolve({ fileId: stream.id, filename, size: stream.length || file.size })
    );
    stream.end(file.buffer);
  });
};

const openDownload = (fileId) => {
  const bucket = getBucket();
  return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
};

const deleteFile = async (fileId) => {
  try {
    await getBucket().delete(new mongoose.Types.ObjectId(fileId));
  } catch (err) {
    // Missing files are not fatal when cleaning up.
    console.error(`[storage] failed to delete file ${fileId}: ${err.message}`);
  }
};

module.exports = { putFile, openDownload, deleteFile, validateFile, MAX_FILE_SIZE, BUCKET };
