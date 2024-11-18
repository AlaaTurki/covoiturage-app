const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true }, // `unique: true` can be uncommented if needed
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  role: { type: String, required: true, enum: ['passager','conducteur'] }, // Role defined as 'conducteur' or 'passager'
  phone: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
