const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Post = require('../models/Post');
const Following = require('../models/Following');

module.exports = {
  async createUser(req, res) {
    try {
      const { firstName, lastName, username, email, password } = req.body;

      const existing_email = await User.findOne({ email });
      const existing_username = await User.findOne({ username });

      if (!existing_email && !existing_username) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
          firstName,
          lastName,
          username,
          email,
          password: hashedPassword,
        });

        return jwt.sign(
          {
            user: {
              _id: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
            },
          },
          process.env.SECRET,
          (error, token) => {
            if (!error && token) {
              return res.status(201).json({
                user: token,
                user_id: user._id,
              });
            } else {
              return res.status(500).json({
                message: 'User creation failed',
              });
            }
          }
        );
      } else {
        return res.status(400).json({
          message: 'Email or username already in use',
        });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Cannot perform the operation' });
    }
  },
  getUserById(req, res) {
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (!error && authData) {
        const authUser = authData.user;
        const { userId } = req.params;
        try {
          const user = await User.findById(userId);

          if (!user) {
            return res.status(404).json({
              message: 'User not found. User may have deactivated account',
            });
          }

          const totalDocs = await Post.find({
            author: userId,
          }).countDocuments();
          const totalFollowing = await Following.find({
            follower: userId,
          }).countDocuments();
          const totalFollower = await Following.find({
            following: userId,
          }).countDocuments();
          const existing_follow = await Following.findOne({
            following: userId,
            follower: authUser._id,
          });
          const isFollowed = !!existing_follow;

          return res.status(200).json({
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            totalDocs,
            totalFollowing,
            totalFollower,
            isFollowed,
          });
        } catch (error) {
          console.log(error);
          return res.status(404).json({
            message: 'user does not exist',
          });
        }
      } else {
        res.status(401).send();
      }
    });
  },
  getUserByName(req, res) {
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (!error && authData) {
        const { username } = req.params;
        const currentPage = req.query.page || 1;
        const perPage = 3;
        try {
          const searchTerm = new RegExp(username);
          const totalDocs = await User.find({
            username: searchTerm,
          }).countDocuments();
          const users = await User.find({ username: searchTerm })
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

          return res.status(200).json({
            users,
            totalUsers: totalDocs,
          });
        } catch (error) {
          return res.status(404).json({
            message: 'user does not exist',
          });
        }
      } else {
        res.status(401).send();
      }
    });
  },
};
