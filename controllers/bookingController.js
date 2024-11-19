const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const User = require('../models/User');


// Book a ride (passenger booking a seat)
exports.bookRide = async (req, res) => {
  const { rideId } = req.body;
  const userId = req.user.id;

  try {
    // Check if the ride exists
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if the passenger is already booked
    const existingBooking = await Booking.findOne({ ride: rideId, passenger: userId });
    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked a seat on this ride' });
    }

    // Check if there are available seats
    if (ride.seatsAvailable <= 0) {
      return res.status(400).json({ message: 'No available seats on this ride' });
    }

    // Create a new booking
    const newBooking = new Booking({
      ride: rideId,
      passenger: userId,
    });

    // Save the booking
    await newBooking.save();

    // Update the ride to reflect one less available seat
    ride.seatsAvailable -= 1;
    await ride.save();

    res.status(201).json({ message: 'Booking successful', booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all bookings made by the current user
exports.getUserBookings = async (req, res) => {
  const userId = req.user.id;

  try {
    const bookings = await Booking.find({ passenger: userId }).populate('ride');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all bookings for a specific ride (for the driver to see passengers)
exports.getBookingsForRide = async (req, res) => {
  const rideId = req.params.rideId;

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const bookings = await Booking.find({ ride: rideId }).populate('passenger');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  const bookingId = req.params.bookingId;
  const userId = req.user.id;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the logged-in user is the one who made the booking
    if (booking.passenger.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to cancel this booking' });
    }

    // Remove the booking and update the ride's available seats
    const ride = await Ride.findById(booking.ride);
    ride.seatsAvailable += 1;
    await ride.save();

    await booking.remove();
    res.status(200).json({ message: 'Booking canceled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
