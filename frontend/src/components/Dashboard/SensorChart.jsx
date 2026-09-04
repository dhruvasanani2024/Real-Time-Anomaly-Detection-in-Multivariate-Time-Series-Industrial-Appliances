import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

// Sensor names
const SENSOR_NAMES = [
  'FIT101', 'LIT101', 'MV101', 'P101', 'P102', 'AIT201', 'AIT202',
  'AIT203', 'FIT201', 'MV201', 'P201', 'P202', 'P203', 'P204',
  'P205', 'P206', 'DPIT301', 'FIT301', 'LIT301', 'MV301', 'MV302',
  'MV303', 'MV304', 'P301', 'P302', 'AIT401', 'AIT402', 'FIT401',
  'LIT401', 'P401', 'P402', 'P403', 'P404', 'UV401', 'AIT501',
  'AIT502', 'AIT503', 'AIT504', 'FIT501', 'FIT502', 'FIT503',
  'FIT504', 'P501', 'P502', 'PIT501', 'PIT502', 'PIT503',
  'FIT601', 'P601', 'P602', 'P603'
];

const SensorChart = ({ data, result }) => {
  const [selectedSensor, setSelectedSensor] = useState(0);
  const isAnomaly = result?.hybrid?.is_anomaly || false;

  // Prepare chart data
  const chartData = data.map((timestep, index) => ({
    time: index,
    value: timestep[selectedSensor],
  }));

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Sensor</InputLabel>
        <Select
          value={selectedSensor}
          onChange={(e) => setSelectedSensor(e.target.value)}
          label="Select Sensor"
        >
          {SENSOR_NAMES.map((name, idx) => (
            <MenuItem key={idx} value={idx}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="time" 
            label={{ value: 'Timestep', position: 'bottom' }}
          />
          <YAxis 
            label={{ value: SENSOR_NAMES[selectedSensor], angle: -90, position: 'left' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
          />
          <Legend />
          
          {/* Anomaly threshold line */}
          {result && (
            <ReferenceLine
              y={result.lstm?.threshold || 0}
              stroke="#ff4081"
              strokeDasharray="5 5"
              label="Threshold"
            />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke={isAnomaly ? '#ff4081' : '#00bcd4'}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default SensorChart;