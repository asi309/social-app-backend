const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Post = require('../models/Post');

module.exports = {
  likePost(req, res) {
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (error) {
        return res.status(401).json({ message: 'Not Authorized' });
      } else {
        const { user_id, post_id } = req.headers;

        try {
          const existing_post = await Post.findById(post_id);
          if (!existing_post) {
            return res
              .status(400)
              .json({ message: 'Post might have been removed by author' });
          }

          const existing_likes_index = existing_post.likes.findIndex(
            (like) => like.user.toString() === user_id.toString()
          );

          if (existing_likes_index > -1) {
            existing_post.likes.splice(existing_likes_index, 1);
          } else {
            existing_post.likes.push({ user: user_id });
          }

          await existing_post.save();

          return res.status(200).json({
            message: 'Post liked',
            existing_post,
          });
        } catch (error) {
          return res
            .status(400)
            .json({ message: 'Cannot perform the operation' });
        }
      }
    });
  },
  createComment(req, res) {
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (error) {
        return res.status(401).json({ message: 'Not Authorized' });
      } else {
        const { user_id, post_id } = req.headers;
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
            author: user_id,
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
      }
    });
  },
};
