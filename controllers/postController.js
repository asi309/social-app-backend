const Post = require('../models/Post');
const User = require('../models/User');

module.exports = {
  async createPost(req, res) {
    const { content } = req.body;
    const { user_id } = req.headers;

    try {
      const existing_user = await User.findById(user_id);
      if (!existing_user) {
        return res.status(400).json({ message: 'User not found' });
      }
      const post = await Post.create({
        content,
        author: user_id,
      });
      await post.populate('author', '-password').execPopulate();

      return res.json({
        message: 'Post created successfully',
        post,
      });
    } catch (error) {
      return res.status(400).json({ message: 'Cannot create post' });
    }
  },
  async getPostByUser(req, res) {
    const { user_id } = req.headers;

    try {
      const posts = await Post.find({ author: user_id });
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json(posts);
    } catch (error) {
      return res.status(400).send();
    }
  },
};
