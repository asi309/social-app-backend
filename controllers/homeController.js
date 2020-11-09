const jwt = require('jsonwebtoken');

const Following = require('../models/Following');
const Post = require('../models/Post');

module.exports = {
  async showAllPosts(req, res) {
    try {
      const following_docs = await Following.find({
        follower: req.user_id,
      });

      if (following_docs.length === 0) {
        return res
          .status(200)
          .json({ message: 'Follow people to see their posts' });
      }

      let feedPosts = [];
      for (following_doc of following_docs) {
        const posts = await Post.find({
          author: following_doc.following._id,
        });
        for (post of posts) {
          await post.populate('author', '-password').execPopulate();
          feedPosts.push(post);
        }
      }

      if (feedPosts.length === 0) {
        return res.status(200).json({
          message: 'Nothing to show here',
          length: 0,
        });
      }

      feedPosts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      return res.status(200).json({
        message: 'Found posts',
        feedPosts,
        length: feedPosts.length,
      });
    } catch (error) {
      res.status(400).json({ message: 'Cannot load feed' });
    }
  },
};
