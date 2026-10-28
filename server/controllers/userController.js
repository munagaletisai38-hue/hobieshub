const User = require('../models/User');
const Thread = require('../models/Thread');
const Post = require('../models/Post');

// @desc    Get user profile
// @route   GET /api/users/:id
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user's recent threads
    const recentThreads = await Thread.find({ author: user._id })
      .sort('-createdAt')
      .limit(5)
      .populate('forum', 'name icon color');

    // Get user's recent posts
    const recentPosts = await Post.find({ author: user._id })
      .sort('-createdAt')
      .limit(5)
      .populate('thread', 'title');

    res.status(200).json({
      success: true,
      data: {
        user,
        recentThreads,
        recentPosts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
exports.updateProfile = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const { bio, interests, avatar } = req.body;
    const updateFields = {};

    if (bio !== undefined) updateFields.bio = bio;
    if (interests !== undefined) updateFields.interests = interests;
    if (avatar !== undefined) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find()
      .sort('-reputation')
      .limit(10)
      .select('username avatar reputation level badges threadCount postCount');

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};
