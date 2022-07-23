function verifyToken(req, res, next) {
  const bearerToken = req.header('user');
  if (typeof bearerToken !== 'undefined') {
    req.token = bearerToken;
    next();
  } else {
    res.status(403).send();
  }
}

module.exports = verifyToken;
