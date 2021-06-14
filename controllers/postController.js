const jwt = require('jsonwebtoken');

const Post = require('../models/Post');
const User = require('../models/User');

module.exports = {
  createPost(req, res) {
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (!error && authData) {
        const { user } = authData;
        const { content } = req.body;

        try {
          const existing_user = await User.findById(user._id);
          if (!existing_user) {
            return res.status(400).json({ message: 'User not found' });
          }
          const post = await Post.create({
            content,
            author: user._id,
            // author: req.user_id,
          });
          await post.populate('author', '-password').execPopulate();

          return res.status(201).json({
            message: 'Post created successfully',
            post,
          });
        } catch (error) {
          return res.status(400).json({ message: 'Cannot create post' });
        }
      } else {
        res.status(401).send();
      }
    });
  },
  getPostByUser(req, res) {
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (!error && authData) {
        const { user } = authData;
        const { user_id } = req.headers;
        const currentPage = req.query.page || 1;
        const perPage = 3;
        try {
          const totalDocs = await Post.find({
            author: user_id,
          }).countDocuments();
          const posts = await Post.find({ author: user_id })
            .populate('author', '-password')
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

          return res.status(200).json({
            posts,
            length: perPage < totalDocs ? perPage : totalDocs,
            totalPosts: totalDocs,
          });
        } catch (error) {
          return res.status(400).send();
        }
      } else {
        res.status(401).send();
      }
    });
  },
  getPostById(req, res) {
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (!error && authData) {
        const { postId } = req.params;
        try {
          const post = await Post.findById(postId);
          await post.populate('author', '-password').execPopulate();

          return res.status(200).json(post);
        } catch (error) {
          return res.status(404).json({
            message: 'Cannot find post',
          });
        }
      } else {
        res.status(401).send();
      }
    });
  },
};
