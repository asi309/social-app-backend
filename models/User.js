const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  email: String,
  password: String,
});

module.exports = mongoose.model('User', UserSchema);
