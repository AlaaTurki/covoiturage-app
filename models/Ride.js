const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  departureTime: { type: Date, required: true },
  seatsAvailable: { type: Number, required: true },
  description: { type: String, default: '' },
}, { timestamps: true });

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
