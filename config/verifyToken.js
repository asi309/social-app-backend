const { request } = require('express');
const jwt = require('jsonwebtoken');

const redisClient = require('./redisClient');

function verifyToken(req, res, next) {
  const token = req.cookies.auth;
  const { user_id } = req.headers;
  // if no token, unauthorized
  if (typeof token !== 'undefined') {
    jwt.verify(token, process.env.SECRET, async (error, authData) => {
      // if token is not verified, unauthorized
      if (error) {
        return res.status(401).json({ message: 'Not Authorized' });
      }
      redisClient.hget(`users:${user_id}`, 'authToken', (err, reply) => {
        // error in redis operation
        if (err) {
          return console.log('Error', err);
        }
        // if token does not match with the token for this user, unauthorized
        if (reply === token) {
          request.token = token;
          next();
        } else {
          return res.status(401).json({ message: 'Not Authorized' });
        }
      });
    });
  } else {
    res.status(401).json({ message: 'Not Authorized' });
  }
}

module.exports = verifyToken;
