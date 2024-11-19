const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  role: { type: String, required: true }, // 'conducteur' or 'passager'
  phone: { type: String, required: true },
  username: { type: String, unique: true, default: function() { return this.email; } },
});

module.exports = mongoose.model('User', userSchema);

