const { validationResult } = require('express-validator');

// Mock greenhouse data - in a real app, this would come from sensors/database
let greenhouseData = {
  temperature: 23,
  humidity: 45,
  soilMoisture: 32,
  lightLevel: 'Low',
  systemStatus: 'Online',
  fanStatus: false,
  heaterStatus: false,
    lightsStatus: false,
  waterStatus: false,
  lastUpdated: new Date()
};

// Get current greenhouse data
exports.getGreenhouseData = async (req, res) => {
  try {
    // Simulate live data updates
    greenhouseData.temperature = Math.round(20 + Math.random() * 10);
    greenhouseData.humidity = Math.round(40 + Math.random() * 20);
    greenhouseData.soilMoisture = Math.round(25 + Math.random() * 30);
    const newLightLevel = ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];
    greenhouseData.lightLevel = newLightLevel;
    // Only turn on lights automatically if the light level is 'Low' and they are not already on
    if (newLightLevel === 'Low' && !greenhouseData.lightsStatus) {
      greenhouseData.lightsStatus = true;
    }
    greenhouseData.lastUpdated = new Date();

    res.status(200).json({
      success: true,
      data: greenhouseData
    });
  } catch (error) {
    console.error('Get greenhouse data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching greenhouse data'
    });
  }
};

// Update greenhouse controls
exports.updateControls = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { control, status } = req.body;
    
    if (greenhouseData.hasOwnProperty(control)) {
      greenhouseData[control] = status;
      greenhouseData.lastUpdated = new Date();

      res.status(200).json({
        success: true,
        message: `${control} ${status ? 'activated' : 'deactivated'} successfully`,
        data: greenhouseData
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid control parameter'
      });
    }
  } catch (error) {
    console.error('Update controls error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating controls'
    });
  }
};

// Get historical data
exports.getHistoricalData = async (req, res) => {
  try {
    // Mock historical data - in a real app, this would come from database
    const historicalData = [
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        temperature: 23,
        humidity: 45,
        soilMoisture: 32,
        lightLevel: 'Low',
        event: 'Temperature optimal at 23°C'
      },
      {
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        temperature: 22,
        humidity: 48,
        soilMoisture: 30,
        lightLevel: 'Medium',
        event: 'Soil moisture level: 32%'
      },
      {
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        temperature: 24,
        humidity: 42,
        soilMoisture: 35,
        lightLevel: 'Low',
        event: 'Fan activated - humidity reduced'
      },
      {
        timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        temperature: 25,
        humidity: 50,
        soilMoisture: 28,
        lightLevel: 'High',
        event: 'Light level: Low - artificial lighting activated'
      }
    ];

    res.status(200).json({
      success: true,
      data: historicalData
    });
  } catch (error) {
    console.error('Get historical data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching historical data'
    });
  }
};