const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (error) {
        return res.status(401).json({ message: 'Not Authorized' });
      }
      return res.clearCookie('auth').json({ message: 'Logout successful' });
    });
  },
};
