const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = require('mongodb');

/**
 * Get (or lazily create) the GridFS bucket on the current connection.
 */
const getBucket = () => {
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB chưa kết nối');
  return new GridFSBucket(db, { bucketName: 'media' });
};

/**
 * Upload a file buffer to GridFS.
 * @param {Buffer}  buffer   – file contents (from multer memoryStorage)
 * @param {string}  filename – original filename
 * @param {string}  mimetype – e.g. 'image/jpeg'
 * @returns {Promise<string>} – the stored ObjectId as a hex string
 */
const uploadToGridFS = (buffer, filename, mimetype) =>
  new Promise((resolve, reject) => {
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimetype,
    });

    uploadStream.on('error', reject);
    uploadStream.on('finish', () => resolve(uploadStream.id.toString()));
    uploadStream.end(buffer);
  });

/**
 * Open a download stream for a stored file.
 * @param {string} fileId – hex ObjectId string
 * @returns {{ stream: ReadableStream, file: object }}
 */
const getFileStream = async (fileId) => {
  const bucket = getBucket();
  const _id = new ObjectId(fileId);

  // Find file metadata first (to get contentType)
  const files = await bucket.find({ _id }).toArray();
  if (!files.length) return null;

  return {
    stream: bucket.openDownloadStream(_id),
    file: files[0],
  };
};

/**
 * Delete a file from GridFS by its ObjectId string.
 * Silently ignores "file not found" errors.
 */
const deleteFromGridFS = async (fileId) => {
  try {
    const bucket = getBucket();
    await bucket.delete(new ObjectId(fileId));
  } catch (err) {
    if (err.message?.includes('not found')) return;
    throw err;
  }
};

module.exports = { uploadToGridFS, getFileStream, deleteFromGridFS };
