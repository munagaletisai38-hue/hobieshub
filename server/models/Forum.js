const mongoose = require('mongoose');

const ForumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Forum name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    default: '💬'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  gradient: {
    type: String,
    default: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
  },
  threadCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Forum', ForumSchema);
