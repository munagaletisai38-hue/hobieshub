const express = require('express');
const { getUserProfile, updateProfile, getLeaderboard } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/:id', getUserProfile);
router.put('/:id', protect, updateProfile);

module.exports = router;
