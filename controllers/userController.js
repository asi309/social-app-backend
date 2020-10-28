const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

module.exports = {
  async createUser(req, res) {
    try {
      const { firstName, lastName, username, email, password } = req.body;

      const existing_user = await User.findOne({ email });

      if (!existing_user) {
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
          (error, token) =>
            res
              .cookie('auth', token, { httpOnly: true, expires: 0 })
              .json({ user_id: user._id })
        );
      } else {
        return res.status(400).json({
          message: 'Email already in use',
        });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Cannot perform the operation' });
    }
  },
  async getUserById(req, res) {
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (error) {
        return res.status(401).json({ message: 'Not Authorized' });
      } else {
        const { userId } = req.params;
        try {
          const user = await User.findById(userId);

          return res.status(200).json({
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.firstName,
            email: user.email,
          });
        } catch (error) {
          return res.status(404).json({
            message: 'user does not exist',
          });
        }
      }
    });
  },
};
