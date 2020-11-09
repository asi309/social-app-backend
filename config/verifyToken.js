const jwt = require('jsonwebtoken');

const redisClient = require('./redisClient');

function verifyToken(req, res, next) {
  const token = req.cookies.auth;
  // if no token, unauthorized -> else
  if (token) {
    const jwtPayload = jwt.verify(token, process.env.SECRET);
    // if token is not verified, unauthorized
    if (!jwtPayload) {
      return res
        .clearCookie('auth')
        .status(401)
        .json({ message: 'Not Authorized' });
    }
    redisClient
      .hget(`users:${jwtPayload.user._id}`, 'authToken')
      .then((value) => {
        if (value === token) {
          req.token = token;
          req.user_id = jwtPayload.user._id;
          next();
        } else {
          return res
            .status(401)
            .clearCookie('auth')
            .json({ message: 'Not Authorized' });
        }
      });
  } else {
    res.status(401).json({ message: 'Not Authorized' });
  }
}

module.exports = verifyToken;
