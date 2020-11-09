const Post = require('../models/Post');

module.exports = {
  async likePost(req, res) {
    const { post_id } = req.headers;

    try {
      const existing_post = await Post.findById(post_id);
      if (!existing_post) {
        return res
          .status(400)
          .json({ message: 'Post might have been removed by author' });
      }

      const existing_likes_index = existing_post.likes.findIndex(
        (like) => like.user.toString() === req.user_id.toString()
      );

      if (existing_likes_index > -1) {
        existing_post.likes.splice(existing_likes_index, 1);
      } else {
        existing_post.likes.push({ user: req.user_id });
      }

      await existing_post.save();

      return res.status(200).json({
        message: 'Post liked',
        existing_post,
      });
    } catch (error) {
      return res.status(400).json({ message: 'Cannot perform the operation' });
    }
  },
  async createComment(req, res) {
    const { post_id } = req.headers;
    const { content } = req.body;

    try {
      const existing_post = await Post.findById(post_id);
      if (!existing_post) {
        return res
          .status(400)
          .json({ message: 'Post might have been removed by author' });
      }

      existing_post.comments.push({
        content,
        author: req.user_id,
        date: Date.now(),
      });

      await existing_post.save();

      return res.status(201).json({
        message: 'Comment added',
        existing_post,
      });
    } catch (error) {
      return res.status(400).json({ message: 'Cannot perform the operation' });
    }
  },
};
