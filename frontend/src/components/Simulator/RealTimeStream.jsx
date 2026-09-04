import React, { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { useAppContext } from '../../context/AppContext';
import { predictAnomaly } from '../../services/api';

const RealTimeStream = () => {
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const intervalRef = useRef(null);
  const dataRef = useRef([]);
  const windowSize = 30;

  // Generate synthetic data (since we don't have CSV)
  const generateData = () => {
    const rows = [];
    for (let i = 0; i < 2000; i++) {
      const row = [];
      for (let j = 0; j < 51; j++) {
        let baseValue = Math.random() * 10;
        // Make some sensors follow patterns
        if (j === 0) baseValue = 10 + Math.sin(i * 0.05) * 3 + Math.random() * 0.5;
        if (j === 1) baseValue = 100 + Math.sin(i * 0.03) * 15 + Math.random() * 1;
        if (j === 2) baseValue = Math.round(Math.random() * 2 + 1);
        if (j === 3) baseValue = Math.round(Math.random() * 2 + 1);
        // Inject occasional anomalies
        if (i > 500 && i < 520 && j === 0) {
          baseValue = 50 + Math.random() * 10; // Anomaly spike
        }
        if (i > 1000 && i < 1020 && j === 1) {
          baseValue = 200 + Math.random() * 20; // Anomaly spike
        }
        row.push(baseValue);
      }
      rows.push(row);
    }
    return rows;
  };

  // Load data
  const loadData = () => {
    setIsLoadingData(true);
    try {
      const rows = generateData();
      dataRef.current = rows;
      setTotalRows(rows.length);
      setCurrentIndex(0);
      setProgress(0);
      
      if (rows.length >= windowSize) {
        const initialWindow = rows.slice(0, windowSize);
        setSensorData(initialWindow);
      }
      setError(null);
    } catch (err) {
      setError('Failed to generate data: ' + err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Update the data window
  const updateWindow = async () => {
    if (!dataRef.current.length) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex + windowSize > dataRef.current.length) {
      // Loop back to start
      setCurrentIndex(0);
      const newWindow = dataRef.current.slice(0, windowSize);
      setSensorData(newWindow);
      setProgress(0);
      await sendPrediction(newWindow);
      return;
    }

    setCurrentIndex(nextIndex);
    const progressPercent = (nextIndex / (dataRef.current.length - windowSize)) * 100;
    setProgress(progressPercent);

    const newWindow = dataRef.current.slice(nextIndex, nextIndex + windowSize);
    setSensorData(newWindow);
    await sendPrediction(newWindow);
  };

  // Send prediction to backend
  const sendPrediction = async (data) => {
    try {
      setIsLoading(true);
      const result = await predictAnomaly(data);
      setPredictionResult(result);
      
      setHistory(prev => [...prev, {
        timestamp: new Date().toISOString(),
        index: currentIndex,
        score: result.hybrid?.combined_score || 0,
        isAnomaly: result.hybrid?.is_anomaly || false,
        ifScore: result.isolation_forest?.score || 0,
        lstmScore: result.lstm?.normalized_score || 0,
      }]);
      
      setHistory(prev => prev.slice(-100));
    } catch (err) {
      setError('Prediction failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Start streaming
  const startStreaming = async () => {
    if (isRunning) return;
    
    if (!dataRef.current.length) {
      loadData();
      // Wait a moment for data to load
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsRunning(true);
    
    if (sensorData.length >= windowSize) {
      await sendPrediction(sensorData);
    }
    
    intervalRef.current = setInterval(updateWindow, 1000);
  };

  // Stop streaming
  const stopStreaming = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant={isRunning ? 'contained' : 'outlined'}
          color={isRunning ? 'error' : 'primary'}
          startIcon={isRunning ? <StopIcon /> : <PlayArrowIcon />}
          onClick={isRunning ? stopStreaming : startStreaming}
          disabled={isLoadingData}
          sx={{ flex: 1 }}
        >
          {isRunning ? 'Stop Stream' : 'Start Stream'}
        </Button>
        
        <Button
          variant="outlined"
          onClick={loadData}
          disabled={isRunning || isLoadingData}
        >
          Generate Data
        </Button>
      </Box>

      {isLoadingData && (
        <LinearProgress sx={{ mb: 2 }} />
      )}
      
      {totalRows > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Progress: {progress.toFixed(1)}% ({currentIndex.toLocaleString()} / {totalRows.toLocaleString()} rows)
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Box>
      )}

      {history.length > 0 && (
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Samples: {history.length}
          </Typography>
          <Typography variant="caption" color={history.filter(h => h.isAnomaly).length > 0 ? 'error' : 'textSecondary'}>
            Anomalies: {history.filter(h => h.isAnomaly).length}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Last Score: {(history[history.length-1]?.score || 0).toFixed(3)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RealTimeStream;