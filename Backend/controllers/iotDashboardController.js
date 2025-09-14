// Mock actuator states
let actuators = {
    waterPump: { status: 'Inactive', mode: 'manual' },
    growLights: { status: 'Inactive', mode: 'manual' },
    dcFan: { status: 'Inactive', mode: 'manual' },
    heatingPad: { status: 'Inactive', mode: 'manual' },
};

// Function to generate random sensor data for mocking
const generateMockSensorData = () => {
    const soilMoisture = Math.floor(Math.random() * 101);
    const lux = Math.floor(Math.random() * 2001);
    const temperature = (Math.random() * (35 - 15) + 15).toFixed(1);
    const humidity = Math.floor(Math.random() * (80 - 40) + 40);

    // Auto-mode logic for actuators
    if (actuators.growLights.mode === 'auto') {
        actuators.growLights.status = lux < 500 ? 'Active' : 'Inactive';
    }
    if (actuators.dcFan.mode === 'auto') {
        actuators.dcFan.status = temperature > 28 ? 'Active' : 'Inactive';
    }
    if (actuators.heatingPad.mode === 'auto') {
        actuators.heatingPad.status = temperature < 20 ? 'Active' : 'Inactive';
    }

    return {
        soilMoisture,
        lux,
        temperature,
        humidity,
    };
};

exports.getSensorData = (req, res) => {
    const sensorData = generateMockSensorData();
    res.json({ 
        sensors: sensorData, 
        actuators 
    });
};

exports.controlActuator = (req, res) => {
    const { actuator, property, value } = req.body;
    if (actuators[actuator]) {
        actuators[actuator][property] = value;
        res.json({ success: true, actuators });
    } else {
        res.status(400).json({ success: false, message: 'Invalid actuator' });
    }
};
