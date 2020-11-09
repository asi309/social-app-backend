const redis = require('ioredis');

const redisClient = new redis();

module.exports = redisClient;
