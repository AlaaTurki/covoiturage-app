const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route to book a ride (passenger booking a seat)
router.post('/book', authMiddleware.verifyToken, bookingController.bookRide);

// Route to get all bookings made by the current user
router.get('/user', authMiddleware.verifyToken, bookingController.getUserBookings);

// Route to get all bookings for a specific ride (driver can see passengers)
router.get('/ride/:rideId', authMiddleware.verifyToken, bookingController.getBookingsForRide);

// Route to cancel a booking
router.delete('/:bookingId', authMiddleware.verifyToken, bookingController.cancelBooking);

module.exports = router;
