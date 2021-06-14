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
            if (!error && token) {
              return res.json({
                user: token,
                user_id: userResponse._id,
              });
            } else {
              return res
                .status(500)
                .json({ message: 'Could not login. Try again later.' });
            }
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
};
