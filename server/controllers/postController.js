const Post = require('../models/Post');
const Thread = require('../models/Thread');
const Forum = require('../models/Forum');
const User = require('../models/User');

// @desc    Get posts for a thread
// @route   GET /api/posts?thread=:threadId
exports.getPosts = async (req, res, next) => {
  try {
    const { thread, page = 1, limit = 20 } = req.query;

    if (!thread) {
      return res.status(400).json({ success: false, message: 'Thread ID is required' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Post.countDocuments({ thread });

    const posts = await Post.find({ thread })
      .sort('createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username avatar level reputation bio postCount threadCount joinedAt')
      .populate('parentPost', 'content author');

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create post
// @route   POST /api/posts
exports.createPost = async (req, res, next) => {
  try {
    const { content, thread, parentPost } = req.body;

    if (!content || !thread) {
      return res.status(400).json({ success: false, message: 'Content and thread are required' });
    }

    // Verify thread exists and is not locked
    const threadDoc = await Thread.findById(thread);
    if (!threadDoc) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }
    if (threadDoc.isLocked) {
      return res.status(403).json({ success: false, message: 'Thread is locked' });
    }

    const post = await Post.create({
      content,
      author: req.user._id,
      thread,
      parentPost: parentPost || null
    });

    // Update thread stats
    threadDoc.postCount += 1;
    threadDoc.lastReply = Date.now();
    threadDoc.lastReplyBy = req.user._id;
    await threadDoc.save();

    // Update forum post count
    await Forum.findByIdAndUpdate(threadDoc.forum, {
      $inc: { postCount: 1 },
      lastActivity: Date.now()
    });

    // Update user post count and reputation
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { postCount: 1, reputation: 1 }
    });

    const populated = await Post.findById(post._id)
      .populate('author', 'username avatar level reputation bio postCount threadCount joinedAt');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on post
// @route   PUT /api/posts/:id/vote
exports.votePost = async (req, res, next) => {
  try {
    const { type } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user._id;
    const hasUpvoted = post.upvotes.includes(userId);
    const hasDownvoted = post.downvotes.includes(userId);

    if (type === 'up') {
      if (hasUpvoted) {
        post.upvotes.pull(userId);
      } else {
        post.upvotes.push(userId);
        if (hasDownvoted) post.downvotes.pull(userId);
      }
    } else if (type === 'down') {
      if (hasDownvoted) {
        post.downvotes.pull(userId);
      } else {
        post.downvotes.push(userId);
        if (hasUpvoted) post.upvotes.pull(userId);
      }
    }

    post.voteScore = post.upvotes.length - post.downvotes.length;
    await post.save();

    // Update author reputation
    const repChange = type === 'up' ? (hasUpvoted ? -1 : 1) : (hasDownvoted ? 1 : -1);
    await User.findByIdAndUpdate(post.author, { $inc: { reputation: repChange } });

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};
