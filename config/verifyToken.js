function verifyToken(req, res, next) {
  const token = req.cookies.auth;
  if (typeof token !== 'undefined') {
    req.token = token;
    next();
  } else {
    res.status(401).json({ message: 'Not Authorized' });
  }
}

module.exports = verifyToken;
