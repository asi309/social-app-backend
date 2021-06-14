const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.header('user');
  // if no token, unauthorized -> else
  if (typeof token !== 'undefined') {
    req.token = token;
    next();
  } else {
    res.status(401).json({ message: 'Not Authorized' });
  }
}

module.exports = verifyToken;
