const Thread = require('../models/Thread');
const Forum = require('../models/Forum');
const User = require('../models/User');

// @desc    Get threads (with filtering)
// @route   GET /api/threads
exports.getThreads = async (req, res, next) => {
  try {
    const { forum, sort = '-createdAt', page = 1, limit = 10 } = req.query;
    const query = {};

    if (forum) query.forum = forum;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Thread.countDocuments(query);

    const threads = await Thread.find(query)
      .sort(sort === 'popular' ? '-voteScore -views' : sort === 'active' ? '-lastReply' : '-isPinned -createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username avatar level reputation')
      .populate('forum', 'name icon color slug')
      .populate('lastReplyBy', 'username avatar');

    res.status(200).json({
      success: true,
      count: threads.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: threads
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single thread
// @route   GET /api/threads/:id
exports.getThread = async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate('author', 'username avatar level reputation bio postCount threadCount joinedAt')
      .populate('forum', 'name icon color slug');

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Increment views
    thread.views += 1;
    await thread.save();

    res.status(200).json({ success: true, data: thread });
  } catch (error) {
    next(error);
  }
};

// @desc    Create thread
// @route   POST /api/threads
exports.createThread = async (req, res, next) => {
  try {
    const { title, content, forum, tags } = req.body;

    if (!title || !content || !forum) {
      return res.status(400).json({ success: false, message: 'Title, content, and forum are required' });
    }

    // Verify forum exists
    const forumDoc = await Forum.findById(forum);
    if (!forumDoc) {
      return res.status(404).json({ success: false, message: 'Forum not found' });
    }

    const thread = await Thread.create({
      title,
      content,
      author: req.user._id,
      forum,
      tags: tags || []
    });

    // Update forum thread count
    forumDoc.threadCount += 1;
    forumDoc.lastActivity = Date.now();
    await forumDoc.save();

    // Update user thread count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { threadCount: 1, reputation: 2 }
    });

    const populated = await Thread.findById(thread._id)
      .populate('author', 'username avatar level reputation')
      .populate('forum', 'name icon color slug');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on thread
// @route   PUT /api/threads/:id/vote
exports.voteThread = async (req, res, next) => {
  try {
    const { type } = req.body; // 'up' or 'down'
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    const userId = req.user._id;
    const hasUpvoted = thread.upvotes.includes(userId);
    const hasDownvoted = thread.downvotes.includes(userId);

    if (type === 'up') {
      if (hasUpvoted) {
        thread.upvotes.pull(userId);
      } else {
        thread.upvotes.push(userId);
        if (hasDownvoted) thread.downvotes.pull(userId);
      }
    } else if (type === 'down') {
      if (hasDownvoted) {
        thread.downvotes.pull(userId);
      } else {
        thread.downvotes.push(userId);
        if (hasUpvoted) thread.upvotes.pull(userId);
      }
    }

    thread.voteScore = thread.upvotes.length - thread.downvotes.length;
    await thread.save();

    // Update author reputation
    const repChange = type === 'up' ? (hasUpvoted ? -1 : 1) : (hasDownvoted ? 1 : -1);
    await User.findByIdAndUpdate(thread.author, { $inc: { reputation: repChange } });

    res.status(200).json({ success: true, data: thread });
  } catch (error) {
    next(error);
  }
};
