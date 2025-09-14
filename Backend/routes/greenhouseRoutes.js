const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth.js');

console.log('Express imported in greenhouseRoutes');

try {
  const { getGreenhouseData, updateControls, getHistoricalData } = require('../controllers/greenhouseController');
  console.log('Greenhouse controller imported successfully');
  
  const router = express.Router();
  console.log('Router created successfully');
  
  // Validation middleware
  const controlValidation = [
    body('control')
      .isIn(['fanStatus', 'heaterStatus', 'lightsStatus', 'waterStatus'])
      .withMessage('Invalid control parameter'),
    body('status')
      .isBoolean()
      .withMessage('Status must be a boolean value')
  ];
  
  // All greenhouse routes are protected
  router.get('/data', protect, getGreenhouseData);
  console.log('Greenhouse data route setup');
  
  router.post('/controls', protect, controlValidation, updateControls);
  console.log('Greenhouse controls route setup');
  
  router.get('/historical', protect, getHistoricalData);
  console.log('Greenhouse historical data route setup');
  
  module.exports = router;
} catch (error) {
  console.error('Error in greenhouseRoutes:', error);
  module.exports = express.Router(); // Export empty router as fallback
}