const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const User = require('../models/User');


// Create a new ride
exports.createRide = async (req, res) => {
  const { startLocation, endLocation, departureTime, seatsAvailable, price } = req.body;
  const driverId = req.user.id;  // The logged-in user is the driver

  try {
    const newRide = new Ride({
      startLocation,
      endLocation,
      departureTime,
      seatsAvailable,
      price,
      driver: driverId,
    });

    await newRide.save();
    res.status(201).json({ message: 'Ride created successfully', ride: newRide });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all available rides
exports.getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find();
    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all rides for a specific user (either as a driver or passenger)
exports.getUserRides = async (req, res) => {
  const userId = req.user.id;

  try {
    const rides = await Ride.find({
      $or: [{ driver: userId }, { passengers: userId }],
    });

    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get details of a specific ride
exports.getRideDetails = async (req, res) => {
  const rideId = req.params.rideId;

  try {
    const ride = await Ride.findById(rideId).populate('driver', 'name email');
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.status(200).json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a specific ride
exports.updateRide = async (req, res) => {
  const rideId = req.params.rideId;
  const { startLocation, endLocation, departureTime, seatsAvailable, price } = req.body;

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if the logged-in user is the driver of the ride
    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this ride' });
    }

    // Update ride details
    ride.startLocation = startLocation || ride.startLocation;
    ride.endLocation = endLocation || ride.endLocation;
    ride.departureTime = departureTime || ride.departureTime;
    ride.seatsAvailable = seatsAvailable || ride.seatsAvailable;
    ride.price = price || ride.price;

    await ride.save();
    res.status(200).json({ message: 'Ride updated successfully', ride });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a specific ride
exports.deleteRide = async (req, res) => {
  const rideId = req.params.rideId;

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if the logged-in user is the driver of the ride
    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this ride' });
    }

    await ride.remove();
    res.status(200).json({ message: 'Ride deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
