const jwt = require('jsonwebtoken');

const Following = require('../models/Following');
const User = require('../models/User');

module.exports = {
  follow(req, res) {
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (error) {
        return res.status(401).json({ message: 'Not Authorized' });
      } else {
        const { user_id } = req.headers;
        const { userToFollow } = req.body;

        try {
          const user = await User.findById(userToFollow);
          if (!user) {
            return res.status(400).json({ message: 'Cannot follow user' });
          }

          const existing_follow = await Following.find({
            follower: user_id,
            following: userToFollow,
          });

          if (!existing_follow) {
            const follow_doc = await Following.create({
              follower: user_id,
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
      }
    });
  },
};
