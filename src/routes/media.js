const router = require('express').Router();
const { getFileStream } = require('../utils/gridfs');

/**
 * GET /api/media/:id
 * Stream an image from GridFS by its ObjectId.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await getFileStream(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'File không tồn tại' });
    }

    res.set('Content-Type', result.file.contentType || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=86400'); // cache 1 day
    result.stream.pipe(res);
  } catch (error) {
    // Invalid ObjectId format
    if (error.name === 'BSONError' || error.message?.includes('hex string')) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    next(error);
  }
});

module.exports = router;
