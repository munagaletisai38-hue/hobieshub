const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  reputation: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['Newcomer', 'Enthusiast', 'Contributor', 'Expert', 'Master', 'Legend'],
    default: 'Newcomer'
  },
  badges: [{
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  interests: [{
    type: String,
    trim: true
  }],
  threadCount: { type: Number, default: 0 },
  postCount: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update level based on reputation
UserSchema.pre('save', function(next) {
  if (this.reputation >= 1000) this.level = 'Legend';
  else if (this.reputation >= 500) this.level = 'Master';
  else if (this.reputation >= 200) this.level = 'Expert';
  else if (this.reputation >= 50) this.level = 'Contributor';
  else if (this.reputation >= 10) this.level = 'Enthusiast';
  else this.level = 'Newcomer';
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
UserSchema.methods.getSignedToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

module.exports = mongoose.model('User', UserSchema);
