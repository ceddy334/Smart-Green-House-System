const express = require('express');
const router = express.Router();
const { getSensorData, controlActuator } = require('../controllers/iotDashboardController');

// @route   GET /api/iot/sensors
// @desc    Get live sensor data and actuator states
// @access  Public (for now)
router.get('/sensors', getSensorData);

// @route   POST /api/iot/control
// @desc    Control an actuator
// @access  Public (for now)
router.post('/control', controlActuator);

module.exports = router;
