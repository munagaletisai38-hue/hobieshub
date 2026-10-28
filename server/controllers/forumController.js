const Forum = require('../models/Forum');
const Thread = require('../models/Thread');

// @desc    Get all forums
// @route   GET /api/forums
exports.getForums = async (req, res, next) => {
  try {
    const forums = await Forum.find({ isActive: true }).sort('order');
    res.status(200).json({ success: true, count: forums.length, data: forums });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single forum
// @route   GET /api/forums/:id
exports.getForum = async (req, res, next) => {
  try {
    const forum = await Forum.findById(req.params.id);
    if (!forum) {
      return res.status(404).json({ success: false, message: 'Forum not found' });
    }
    res.status(200).json({ success: true, data: forum });
  } catch (error) {
    next(error);
  }
};

// @desc    Get forum stats
// @route   GET /api/forums/stats
exports.getForumStats = async (req, res, next) => {
  try {
    const forums = await Forum.find({ isActive: true });
    const totalThreads = forums.reduce((sum, f) => sum + f.threadCount, 0);
    const totalPosts = forums.reduce((sum, f) => sum + f.postCount, 0);

    // Get recent threads across all forums
    const recentThreads = await Thread.find()
      .sort('-createdAt')
      .limit(5)
      .populate('author', 'username avatar level')
      .populate('forum', 'name icon color');

    // Get trending threads (most votes in last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trendingThreads = await Thread.find({ createdAt: { $gte: weekAgo } })
      .sort('-voteScore -views')
      .limit(5)
      .populate('author', 'username avatar level')
      .populate('forum', 'name icon color');

    res.status(200).json({
      success: true,
      data: {
        totalForums: forums.length,
        totalThreads,
        totalPosts,
        recentThreads,
        trendingThreads
      }
    });
  } catch (error) {
    next(error);
  }
};
