const express = require('express');
const { getPosts, createPost, votePost } = require('../controllers/postController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getPosts);
router.post('/', protect, createPost);
router.put('/:id/vote', protect, votePost);

module.exports = router;
