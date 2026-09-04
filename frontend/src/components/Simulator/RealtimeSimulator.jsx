import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAppContext } from '../../context/AppContext';
import { predictAnomaly } from '../../services/api';

const RealtimeSimulator = () => {
  const {
    sensorData,
    setSensorData,
    setPredictionResult,
    setIsLoading,
    setError,
    history,
    setHistory,
  } = useAppContext();

  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  // Generate random sensor data (30 timesteps × 51 sensors)
  const generateRandomData = () => {
    return Array.from({ length: 30 }, () =>
      Array.from({ length: 51 }, () => Math.random() * 10)
    );
  };

  // Simulate real-time data stream
  const simulateData = async () => {
    const newData = generateRandomData();
    setSensorData(newData);
    setIsLoading(true);

    try {
      const result = await predictAnomaly(newData);
      setPredictionResult(result);
      setHistory(prev => [...prev, {
        timestamp: new Date().toISOString(),
        score: result.hybrid.combined_score,
        isAnomaly: result.hybrid.is_anomaly,
      }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    simulateData();
    const id = setInterval(simulateData, 3000);
    setIntervalId(id);
  };

  const stopSimulation = () => {
    setIsRunning(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <Box>
      <Button
        variant={isRunning ? 'contained' : 'outlined'}
        color={isRunning ? 'error' : 'primary'}
        fullWidth
        startIcon={isRunning ? <StopIcon /> : <PlayArrowIcon />}
        onClick={isRunning ? stopSimulation : startSimulation}
      >
        {isRunning ? 'Stop Simulation' : 'Start Real-time Simulation'}
      </Button>

      {history.length > 0 && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Total samples: {history.length} | 
          Anomalies: {history.filter(h => h.isAnomaly).length}
        </Typography>
      )}
    </Box>
  );
};

export default RealtimeSimulator;