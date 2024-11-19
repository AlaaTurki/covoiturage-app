const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route to create a new ride (protected route)
router.post('/', authMiddleware.verifyToken, rideController.createRide);

// Route to get all available rides
router.get('/', rideController.getAllRides);

// Route to get rides for a specific user (as a driver or passenger)
router.get('/user', authMiddleware.verifyToken, rideController.getUserRides);

// Route to get details of a specific ride
router.get('/:rideId', rideController.getRideDetails);

// Route to update a ride (protected route)
router.put('/:rideId', authMiddleware.verifyToken, rideController.updateRide);

// Route to delete a ride (protected route)
router.delete('/:rideId', authMiddleware.verifyToken, rideController.deleteRide);

module.exports = router;
