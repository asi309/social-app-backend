const jwt = require('jsonwebtoken');

const Following = require('../models/Following');
const User = require('../models/User');

module.exports = {
  follow(req, res) {
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (!error && authData) {
        const followerUser = authData.user;
        const { userToFollow } = req.body;

        try {
          const user = await User.findById(userToFollow);
          if (!user) {
            return res.status(400).json({ message: 'Cannot follow user' });
          }

          const existing_follow = await Following.find({
            follower: followerUser._id,
            following: userToFollow,
          });

          if (existing_follow.length === 0) {
            const follow_doc = await Following.create({
              follower: followerUser._id,
              following: userToFollow,
            });

            return res
              .status(201)
              .json({ message: 'Followed successfully', follow_doc });
          }

          return res
            .status(200)
            .json({ message: 'User already followed', existing_follow });
        } catch (error) {
          return res
            .status(400)
            .json({ message: 'Action cannot be performed' });
        }
      } else {
        res.status(401).send();
      }
    });
  },
  unfollow(req, res) {
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (!error && authData) {
        const followerUser = authData.user;
        const { userToUnfollow } = req.params;
        try {
          const user = await User.findById(userToUnfollow);
          if (!user) {
            return res.status(400).json({ message: 'Cannot unfollow user' });
          }

          await Following.findOneAndRemove({
            follower: followerUser._id,
            following: userToUnfollow,
          });

          return res.status(204).send();
        } catch (error) {
          return res
            .status(400)
            .json({ message: 'Action cannot be performed' });
        }
      } else {
        res.status(401).send();
      }
    });
  },
};
