const jwt = require('jsonwebtoken');

const Post = require('../models/Post');

module.exports = {
  likePost(req, res) {
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (!error && authData) {
        const { user } = authData;
        const { post_id } = req.headers;

        try {
          const existing_post = await Post.findById(post_id);
          if (!existing_post) {
            return res
              .status(400)
              .json({ message: 'Post might have been removed by author' });
          }

          const existing_likes_index = existing_post.likes.findIndex(
            (like) => like.user.toString() === user._id.toString()
          );

          let liked = false;

          if (existing_likes_index > -1) {
            existing_post.likes.splice(existing_likes_index, 1);
          } else {
            existing_post.likes.push({ user: user._id });
            liked = true;
          }

          await existing_post.save();

          return res.status(200).json({
            message: liked ? 'Post liked' : 'Post Unliked',
            existing_post,
          });
        } catch (error) {
          return res
            .status(400)
            .json({ message: 'Cannot perform the operation' });
        }
      } else {
        res.status(401).send();
      }
    });
  },
  createComment(req, res) {
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (!error && authData) {
        const { user } = authData;
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
            author: user._id,
            date: Date.now(),
          });

          await existing_post.save();

          return res.status(201).json({
            message: 'Comment added',
            existing_post,
          });
        } catch (error) {
          return res
            .status(400)
            .json({ message: 'Cannot perform the operation' });
        }
      } else {
        res.status(401).send();
      }
    });
  },
};
