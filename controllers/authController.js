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

        return jwt.sign(
          { user: userResponse },
          process.env.SECRET,
          (error, token) => {
            redisClient.hset(`users:${userResponse._id}`, 'authToken', token);
            return res
              .cookie('auth', token, { httpOnly: true, expires: 0 })
              .json({ user_id: userResponse._id });
          }
        );
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
    const { user_id } = req.headers;
    redisClient.hdel(`users:${user_id}`, 'authToken');
    return res.clearCookie('auth').json({ message: 'Logout successful' });
  },
  checkAuthStatus(req, res) {
    const { user_id } = req.headers;
    redisClient.exists(`users:${user_id}`, (err, reply) => {
      if (err) {
        return console.log('error', err);
      }
      if (reply === 1) {
        return res.status(200).json({ message: 'Logged in' });
      }
      return res.status(200).json({ message: 'Invalid session' });
    });
  },
};
