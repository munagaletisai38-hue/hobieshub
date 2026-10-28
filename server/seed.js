const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Forum = require('./models/Forum');
const Thread = require('./models/Thread');
const Post = require('./models/Post');

dotenv.config();

const forums = [
  {
    name: 'Photography',
    slug: 'photography',
    description: 'Share your shots, discuss gear, editing techniques, and composition tips with fellow photographers.',
    icon: '📸',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    order: 1
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    description: 'From retro classics to the latest AAA titles — discuss strategies, share reviews, and find teammates.',
    icon: '🎮',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    order: 2
  },
  {
    name: 'Music',
    slug: 'music',
    description: 'Producers, musicians, and listeners unite! Share tracks, discuss theory, and discover new artists.',
    icon: '🎵',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    order: 3
  },
  {
    name: 'Art & Design',
    slug: 'art-design',
    description: 'Digital art, illustration, UI/UX, and traditional crafts. Showcase your work and get inspired.',
    icon: '🎨',
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)',
    order: 4
  },
  {
    name: 'Cooking',
    slug: 'cooking',
    description: 'Recipes, cooking techniques, and food culture. From home cooks to professional chefs.',
    icon: '🍳',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
    order: 5
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Latest tech news, programming, hardware builds, and software discussions.',
    icon: '💻',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    order: 6
  },
  {
    name: 'Fitness',
    slug: 'fitness',
    description: 'Workout routines, nutrition advice, and progress tracking. Stay motivated together!',
    icon: '💪',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    order: 7
  },
  {
    name: 'Travel',
    slug: 'travel',
    description: 'Destination guides, travel tips, cultural experiences, and adventure stories from around the globe.',
    icon: '✈️',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    order: 8
  }
];

const seedUsers = [
  { username: 'alex_photo', email: 'alex@example.com', password: 'password123', bio: 'Professional photographer & nature lover', interests: ['Photography', 'Travel'], reputation: 250 },
  { username: 'sarah_gamer', email: 'sarah@example.com', password: 'password123', bio: 'Competitive gamer & streamer', interests: ['Gaming', 'Technology'], reputation: 180 },
  { username: 'mike_beats', email: 'mike@example.com', password: 'password123', bio: 'Music producer & DJ', interests: ['Music', 'Technology'], reputation: 120 },
  { username: 'emma_artist', email: 'emma@example.com', password: 'password123', bio: 'Digital artist & illustrator', interests: ['Art & Design', 'Photography'], reputation: 320 },
  { username: 'chef_carlos', email: 'carlos@example.com', password: 'password123', bio: 'Professional chef exploring world cuisines', interests: ['Cooking', 'Travel'], reputation: 95 },
  { username: 'dev_priya', email: 'priya@example.com', password: 'password123', bio: 'Full-stack developer & open source enthusiast', interests: ['Technology', 'Gaming'], reputation: 450 },
  { username: 'fit_jordan', email: 'jordan@example.com', password: 'password123', bio: 'Fitness coach & nutrition expert', interests: ['Fitness', 'Cooking'], reputation: 200 },
  { username: 'wanderlust_li', email: 'li@example.com', password: 'password123', bio: 'Travel blogger — 50+ countries explored', interests: ['Travel', 'Photography'], reputation: 380 }
];

const seedThreads = [
  { title: 'Best Mirrorless Cameras in 2026 — Complete Buying Guide', content: 'I\'ve been testing the latest mirrorless cameras from Sony, Canon, and Nikon. Here\'s my comprehensive breakdown of the top picks for different budgets and use cases. The Sony A7 V continues to impress with its autofocus capabilities, while the Canon R6 III brings incredible video features. Let me share my detailed comparisons and sample shots...', forumSlug: 'photography', tags: ['cameras', 'gear', 'review', 'buying-guide'], userIdx: 0 },
  { title: 'Golden Hour Photography Tips That Will Transform Your Shots', content: 'After years of chasing the golden hour, I\'ve compiled my best tips for making the most of that magical light. From finding the perfect location to nailing your exposure settings, these techniques will elevate your photography game. I\'ll cover composition rules, lens choices, and post-processing workflows...', forumSlug: 'photography', tags: ['tips', 'golden-hour', 'landscape'], userIdx: 0 },
  { title: 'The Most Anticipated Games of Late 2026', content: 'With E3 behind us and some incredible announcements, let\'s discuss what we\'re most excited about. GTA VI DLC, Elder Scrolls VI, and several indie gems are looking phenomenal. Here\'s my top 10 list with release dates and what we know so far about gameplay mechanics...', forumSlug: 'gaming', tags: ['upcoming', 'discussion', '2026'], userIdx: 1 },
  { title: 'From Bronze to Diamond: My Competitive Journey & Tips', content: 'It took me 8 months to climb from Bronze to Diamond in ranked play. Here are the key strategies, mindset shifts, and practice routines that made the difference. I\'ll break down my approach for each rank tier and common mistakes to avoid...', forumSlug: 'gaming', tags: ['competitive', 'tips', 'improvement'], userIdx: 1 },
  { title: 'How I Built a Home Recording Studio Under $500', content: 'You don\'t need thousands of dollars to get professional-sounding recordings. I\'ll walk you through my budget setup including interface, microphone, acoustic treatment, and software choices. Plus tips on room treatment with household items that actually work...', forumSlug: 'music', tags: ['studio', 'budget', 'recording', 'tutorial'], userIdx: 2 },
  { title: 'Digital Art Workflow: From Sketch to Finished Piece', content: 'I want to share my complete digital art workflow using Procreate and Photoshop. This covers everything from initial thumbnail sketches, color palette selection, line art techniques, rendering methods, and final polish. Includes time-lapse videos of my process...', forumSlug: 'art-design', tags: ['workflow', 'tutorial', 'digital-art'], userIdx: 3 },
  { title: 'Mastering Sourdough: A Complete Guide for Beginners', content: 'After two years of baking sourdough, I\'ve perfected my recipe and want to help others avoid common pitfalls. This guide covers starter maintenance, flour choices, hydration levels, shaping techniques, and troubleshooting. Includes my foolproof weekend baking schedule...', forumSlug: 'cooking', tags: ['sourdough', 'baking', 'tutorial', 'beginner'], userIdx: 4 },
  { title: 'Building a Rust-Powered CLI Tool: Step-by-Step', content: 'Rust is incredible for building fast, reliable CLI tools. In this tutorial, I\'ll walk through creating a practical file organizer tool from scratch. We\'ll cover clap for argument parsing, colored output, async file operations, and publishing to crates.io...', forumSlug: 'technology', tags: ['rust', 'cli', 'tutorial', 'programming'], userIdx: 5 },
  { title: 'The Ultimate 12-Week Strength Training Program', content: 'Whether you\'re a beginner or intermediate lifter, this periodized program will help you build strength systematically. Includes progressive overload calculations, deload weeks, accessory work, and nutrition guidelines. I\'ve used this to add 50lbs to my squat...', forumSlug: 'fitness', tags: ['strength', 'program', 'workout', 'beginner'], userIdx: 6 },
  { title: 'Hidden Gems: 10 Underrated Destinations in Southeast Asia', content: 'Beyond the tourist hotspots lie incredible destinations that most travelers miss. From the limestone karsts of Ninh Binh to the coffee plantations of Bolaven Plateau, these places offer authentic cultural experiences without the crowds. Full itineraries included...', forumSlug: 'travel', tags: ['southeast-asia', 'hidden-gems', 'guide'], userIdx: 7 },
  { title: 'Night Photography: Capturing the Milky Way', content: 'Astrophotography has become my obsession. Here\'s everything you need to know about photographing the night sky — from planning with star maps, camera settings for different scenarios, stacking techniques, and post-processing in PixInsight...', forumSlug: 'photography', tags: ['astrophotography', 'night', 'tutorial'], userIdx: 0 },
  { title: 'Building a Retro Gaming Setup: Complete Guide', content: 'I\'ve built the ultimate retro gaming corner with original hardware and CRT displays. Let me share my setup, where to find authentic cartridges, recommended mods for better video output, and how to preserve your collection for years to come...', forumSlug: 'gaming', tags: ['retro', 'setup', 'collection'], userIdx: 1 }
];

const seedPosts = [
  { content: 'Great comparison! I just switched from Canon to Sony and the autofocus difference is night and day. The eye-tracking on the A7V is incredible for portrait work.', threadIdx: 0, userIdx: 3 },
  { content: 'Don\'t sleep on the Fujifilm X-T6 either. The film simulation modes are unmatched and the size factor is perfect for street photography.', threadIdx: 0, userIdx: 7 },
  { content: 'What about Nikon? The Z8 II seems like incredible value compared to the Z9.', threadIdx: 0, userIdx: 2 },
  { content: 'These tips are gold! I never thought about using a graduated ND filter during golden hour. My shots always had blown-out skies before.', threadIdx: 1, userIdx: 3 },
  { content: 'I\'m most excited about Elder Scrolls VI. Been waiting for this since Skyrim and Bethesda looks like they\'ve really put in the work this time.', threadIdx: 2, userIdx: 5 },
  { content: 'Congrats on Diamond! Your tip about focusing on 2-3 champions instead of trying to play everything was the game-changer for me.', threadIdx: 3, userIdx: 5 },
  { content: 'The Focusrite Scarlett Solo is incredible value. Paired with an SM58, you can get surprisingly professional vocals on a budget.', threadIdx: 4, userIdx: 1 },
  { content: 'Your color theory section was amazing! I struggle with picking palettes and your method of starting from real-world reference photos is genius.', threadIdx: 5, userIdx: 0 },
  { content: 'My starter died three times before I figured out the temperature consistency trick you mentioned. Wish I had this guide earlier!', threadIdx: 6, userIdx: 7 },
  { content: 'Rust\'s ownership model was confusing at first but this tutorial breaks it down perfectly. Built my first CLI tool in a weekend!', threadIdx: 7, userIdx: 1 },
  { content: 'The progressive overload calculator in the spreadsheet is fantastic. I\'ve been tracking for 6 weeks and already seeing PRs.', threadIdx: 8, userIdx: 4 },
  { content: 'Ninh Binh was absolutely magical! We rented motorcycles and explored the countryside — felt like stepping back in time.', threadIdx: 9, userIdx: 0 },
  { content: 'Your stacking technique for reducing noise is incredible. I went from noisy mess to clean Milky Way shots in one session!', threadIdx: 10, userIdx: 7 },
  { content: 'Where do you find authentic retro cartridges these days? Most local game shops near me have closed down.', threadIdx: 11, userIdx: 5 },
  { content: 'I\'d also recommend checking out Flea markets and estate sales. Found a complete SNES collection for $50 at a garage sale last month!', threadIdx: 11, userIdx: 4 }
];

async function seedDB(shouldExit = false) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('📦 Connected to MongoDB');
    }

    // Clear existing data
    await User.deleteMany({});
    await Forum.deleteMany({});
    await Thread.deleteMany({});
    await Post.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create forums
    const createdForums = await Forum.insertMany(forums);
    console.log(`✅ Created ${createdForums.length} forums`);

    // Create users
    const createdUsers = [];
    for (const userData of seedUsers) {
      const user = await User.create({
        ...userData,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.username}&backgroundColor=6366f1`
      });
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create threads
    const createdThreads = [];
    for (const threadData of seedThreads) {
      const forum = createdForums.find(f => f.slug === threadData.forumSlug);
      const thread = await Thread.create({
        title: threadData.title,
        content: threadData.content,
        author: createdUsers[threadData.userIdx]._id,
        forum: forum._id,
        tags: threadData.tags,
        voteScore: Math.floor(Math.random() * 30) + 5,
        views: Math.floor(Math.random() * 500) + 50
      });
      createdThreads.push(thread);

      // Update forum thread count
      forum.threadCount += 1;
      await forum.save();

      // Update user thread count
      createdUsers[threadData.userIdx].threadCount += 1;
      await createdUsers[threadData.userIdx].save();
    }
    console.log(`✅ Created ${createdThreads.length} threads`);

    // Create posts
    for (const postData of seedPosts) {
      const post = await Post.create({
        content: postData.content,
        author: createdUsers[postData.userIdx]._id,
        thread: createdThreads[postData.threadIdx]._id,
        voteScore: Math.floor(Math.random() * 15) + 1
      });

      // Update thread post count
      const thread = createdThreads[postData.threadIdx];
      thread.postCount += 1;
      thread.lastReply = post.createdAt;
      thread.lastReplyBy = createdUsers[postData.userIdx]._id;
      await thread.save();

      // Update forum post count
      const forum = createdForums.find(f => f._id.toString() === thread.forum.toString());
      forum.postCount += 1;
      await forum.save();

      // Update user post count
      createdUsers[postData.userIdx].postCount += 1;
      await createdUsers[postData.userIdx].save();
    }
    console.log(`✅ Created ${seedPosts.length} posts`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Test accounts (all passwords: password123):');
    seedUsers.forEach(u => console.log(`   ${u.email} — ${u.username}`));

    if (shouldExit) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seed error:', error);
    if (shouldExit) {
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  seedDB(true);
}

module.exports = seedDB;
