const jwt = require('jsonwebtoken');

const Following = require('../models/Following');
const Post = require('../models/Post');

module.exports = {
  showAllPosts(req, res) {
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (error) {
        res.status(401).json({ message: 'Not Authorized' });
      } else {
        const { user_id } = req.headers;

        try {
          const following_docs = await Following.find({
            follower: user_id,
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
            posts.forEach((post) => {
              feedPosts.push(post);
            });
          }

          feedPosts.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );

          return res.status(200).json({
            message: 'Found posts',
            feedPosts,
          });
        } catch (error) {
          res.status(400).json({ message: 'Cannot load feed' });
        }
      }
    });
  },
};
