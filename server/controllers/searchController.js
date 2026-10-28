const Thread = require('../models/Thread');
const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Search threads, posts, and users
// @route   GET /api/search?q=:query
exports.search = async (req, res, next) => {
  try {
    const { q, type = 'all', page = 1, limit = 10 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const results = {};

    const searchRegex = new RegExp(q.trim(), 'i');

    if (type === 'all' || type === 'threads') {
      const threads = await Thread.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { tags: searchRegex }
        ]
      })
        .sort('-voteScore -createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'username avatar level')
        .populate('forum', 'name icon color');

      const threadCount = await Thread.countDocuments({
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { tags: searchRegex }
        ]
      });

      results.threads = { data: threads, total: threadCount };
    }

    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({ content: searchRegex })
        .sort('-voteScore -createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'username avatar level')
        .populate('thread', 'title');

      const postCount = await Post.countDocuments({ content: searchRegex });

      results.posts = { data: posts, total: postCount };
    }

    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $or: [
          { username: searchRegex },
          { bio: searchRegex }
        ]
      })
        .skip(skip)
        .limit(parseInt(limit))
        .select('username avatar level reputation bio');

      const userCount = await User.countDocuments({
        $or: [
          { username: searchRegex },
          { bio: searchRegex }
        ]
      });

      results.users = { data: users, total: userCount };
    }

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};
