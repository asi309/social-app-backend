const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const redisClient = require('../config/redisClient');
const User = require('../models/User');

module.exports = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: 'Required field missing',
        });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          message:
            'Email or password does not match. Do you want to register instead?',
        });
      }

      if (user && (await bcrypt.compare(password, user.password))) {
        const userResponse = {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        };

        redisClient.exists(`users:${userResponse._id}`).then((value) => {
          if (value === 1) {
            redisClient
              .hget(`users:${userResponse._id}`, 'authToken')
              .then((value) => {
                return res
                  .cookie('auth', value, {
                    httpOnly: true,
                    expires: 0,
                    secure: true,
                  })
                  .json({ user_id: userResponse._id });
              });
          } else {
            return jwt.sign(
              { user: userResponse },
              process.env.SECRET,
              (error, token) => {
                redisClient.hset(
                  `users:${userResponse._id}`,
                  'authToken',
                  token
                );
                return res
                  .cookie('auth', token, {
                    httpOnly: true,
                    expires: 0,
                    secure: true,
                  })
                  .json({ user_id: userResponse._id });
              }
            );
          }
        });
      } else {
        return res.status(400).json({
          message:
            'Email or password does not match. Do you want to register instead?',
        });
      }
    } catch (error) {
      res.status(400).json({ message: 'Cannot perform the operation' });
    }
  },
  logout(req, res) {
    redisClient.exists(`users:${req.user_id}`).then((value) => {
      if (value === 1) {
        redisClient.hdel(`users:${req.user_id}`, 'authToken');
      }
      return res.clearCookie('auth').json({ message: 'Logout successful' });
    });
  },
  checkAuthStatus(req, res) {
    redisClient.exists(`users:${req.user_id}`).then((value) => {
      if (value === 1) {
        return res
          .status(200)
          .json({ message: 'Logged in', user_id: req.user_id });
      }
      return res.status(200).json({ message: 'Invalid session' });
    });
  },
};
