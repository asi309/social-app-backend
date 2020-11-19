const Post = require('../models/Post');
const User = require('../models/User');

module.exports = {
  async createPost(req, res) {
    const { content } = req.body;

    try {
      const existing_user = await User.findById(req.user_id);
      if (!existing_user) {
        return res.status(400).json({ message: 'User not found' });
      }
      const post = await Post.create({
        content,
        author: req.user_id,
      });
      await post.populate('author', '-password').execPopulate();

      return res.status(201).json({
        message: 'Post created successfully',
        post,
      });
    } catch (error) {
      return res.status(400).json({ message: 'Cannot create post' });
    }
  },
  async getPostByUser(req, res) {
    try {
      const posts = await Post.find({ author: req.user_id });
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json(posts);
    } catch (error) {
      return res.status(400).send();
    }
  },
  async getPostById(req, res) {
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
  },
};
