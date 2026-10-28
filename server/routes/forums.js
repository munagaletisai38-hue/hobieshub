const express = require('express');
const { getForums, getForum, getForumStats } = require('../controllers/forumController');

const router = express.Router();

router.get('/stats', getForumStats);
router.get('/', getForums);
router.get('/:id', getForum);

module.exports = router;
