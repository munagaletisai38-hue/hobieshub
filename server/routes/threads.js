const express = require('express');
const { getThreads, getThread, createThread, voteThread } = require('../controllers/threadController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getThreads);
router.get('/:id', getThread);
router.post('/', protect, createThread);
router.put('/:id/vote', protect, voteThread);

module.exports = router;
