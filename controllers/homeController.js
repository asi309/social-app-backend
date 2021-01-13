const jwt = require('jsonwebtoken');

const Following = require('../models/Following');
const Post = require('../models/Post');

module.exports = {
  async showAllPosts(req, res) {
    const currentPage = req.query.page || 1;
    const perPage = 3;
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
      let totalDocs;
      for (following_doc of following_docs) {
        totalDocs = await Post.find({
          author: following_doc.following._id,
        }).countDocuments();

        const posts = await Post.find({
          author: following_doc.following._id,
        })
          .populate('author', '-password')
          .sort({ createdAt: -1 })
          .skip((currentPage - 1) * perPage)
          .limit(perPage);

        feedPosts = feedPosts.concat(posts);
        // for (post of posts) {
        //   await post.populate('author', '-password').execPopulate();
        //   feedPosts.push(post);
        // }
      }

      if (feedPosts.length === 0) {
        return res.status(200).json({
          message: 'Nothing to show here',
          length: 0,
          totalPosts: totalDocs,
        });
      }

      // feedPosts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      return res.status(200).json({
        message: 'Found posts',
        feedPosts,
        length: perPage < totalDocs ? perPage : totalDocs,
        totalPosts: totalDocs,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: 'Cannot load feed' });
    }
  },
};
