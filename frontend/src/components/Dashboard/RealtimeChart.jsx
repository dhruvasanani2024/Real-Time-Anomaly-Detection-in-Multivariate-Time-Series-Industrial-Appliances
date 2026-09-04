import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { FormControl, InputLabel, Select, MenuItem, Box, Typography, Paper } from '@mui/material';

const SENSOR_NAMES = [
  'FIT101 (Flow)', 'LIT101 (Level)', 'MV101 (Valve)', 'P101 (Pump)', 'P102 (Pump)',
  'AIT201 (Chemical)', 'AIT202 (Chemical)', 'AIT203 (Chemical)', 'FIT201 (Flow)',
  'MV201 (Valve)', 'P201', 'P202', 'P203', 'P204', 'P205', 'P206', 'DPIT301',
  'FIT301', 'LIT301', 'MV301', 'MV302', 'MV303', 'MV304', 'P301', 'P302',
  'AIT401', 'AIT402', 'FIT401', 'LIT401', 'P401', 'P402', 'P403', 'P404',
  'UV401', 'AIT501', 'AIT502', 'AIT503', 'AIT504', 'FIT501', 'FIT502',
  'FIT503', 'FIT504', 'P501', 'P502', 'PIT501', 'PIT502', 'PIT503',
  'FIT601', 'P601', 'P602', 'P603'
];

const RealtimeChart = ({ data, result, history }) => {
  const [selectedSensor, setSelectedSensor] = useState(0); // Default to FIT101
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }
    
    console.log('Chart received data:', data);
    console.log('First row sensor 0 value:', data[0]?.[0]);
    
    const formatted = data.map((timestep, i) => {
      const value = timestep[selectedSensor] || 0;
      return {
        time: i,
        value: value,
        isAnomaly: value > 100, // Mark as anomaly if value > 100
      };
    });
    
    console.log('Formatted chart data:', formatted);
    setChartData(formatted);
  }, [data, selectedSensor]);

  // Find max value for y-axis scaling
  const maxValue = Math.max(...chartData.map(d => d.value), 10);
  const yAxisDomain = [0, Math.max(maxValue * 1.2, 20)];

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
            <MenuItem key={idx} value={idx}>{name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
        Current Value: {chartData.length > 0 ? chartData[chartData.length-1]?.value.toFixed(2) : 'N/A'}
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="time" 
            label={{ value: 'Time (seconds)', position: 'bottom', fill: '#888' }}
          />
          <YAxis 
            domain={yAxisDomain}
            label={{ value: SENSOR_NAMES[selectedSensor], angle: -90, position: 'left', fill: '#888' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
          />
          <Legend />

          {result?.hybrid?.threshold && (
            <ReferenceLine 
              y={result.hybrid.threshold} 
              stroke="#ff4081" 
              strokeDasharray="5 5" 
              label="Threshold"
            />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke="#00bcd4"
            strokeWidth={2}
            dot={false}
            name="Sensor Value"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default RealtimeChart;