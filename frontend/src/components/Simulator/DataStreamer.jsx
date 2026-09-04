import React, { useState, useEffect, useRef } from 'react';
import { Button, Box, Typography, LinearProgress, Alert, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { useAppContext } from '../../context/AppContext';
import { predictAnomaly, checkHealth } from '../../services/api';

const DataStreamer = () => {
  const { 
    setSensorData, 
    setPredictionResult, 
    setIsLoading, 
    setError, 
    error,
    history, 
    setHistory,
    setAnomalyLogs 
  } = useAppContext();
  
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [totalRows, setTotalRows] = useState(0);
  const intervalRef = useRef(null);
  const dataRef = useRef([]);
  const indexRef = useRef(0);
  const WINDOW = 30;
  const UPDATE_INTERVAL = 1000;

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await checkHealth();
        setBackendStatus('online');
        setError(null);
      } catch (err) {
        setBackendStatus('offline');
        setError('Backend not running. Start the server on port 8000');
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

 const generateData = () => {
    const rows = [];
    const startTime = new Date();
    startTime.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 100; i++) {  // Only 100 rows for quick testing
      const row = [];
      const timestamp = new Date(startTime.getTime() + i * 1000);
      row.push(timestamp.toISOString());
      
      for (let j = 0; j < 51; j++) {
        let val;
        
        // ================================================================
        // NORMAL PATTERNS
        // ================================================================
        if (j === 0) val = 10 + Math.sin(i * 0.05) * 3 + (Math.random() - 0.5) * 0.5;
        else if (j === 1) val = 100 + Math.sin(i * 0.03) * 15 + (Math.random() - 0.5) * 1;
        else if (j === 2 || j === 3 || j === 4) val = Math.round(Math.random() * 1 + 1);
        else if (j === 5) val = 250 + Math.sin(i * 0.02) * 20 + (Math.random() - 0.5) * 2;
        else val = Math.random() * 100 + Math.sin(i * 0.01) * 10;
        
        // ================================================================
        // ANOMALY - STARTS AT ROW 5 (5 SECONDS IN)
        // ================================================================
        if (i > 5 && i < 15) {  // Anomaly from 5-15 seconds
          if (j === 0) val = 1000 + Math.random() * 500;   // FIT101: 1000-1500
          if (j === 1) val = 2000 + Math.random() * 1000;  // LIT101: 2000-3000
          if (j === 2) val = 0;
          if (j === 3) val = 0;
          if (j === 4) val = 0;
          if (j === 5) val = 1500 + Math.random() * 500;   // Chemical spike
        }
        
        // ================================================================
        // SECOND ANOMALY - AT ROW 40
        // ================================================================
        if (i > 40 && i < 50) {
          if (j === 0) val = 2000 + Math.random() * 1000;
          if (j === 1) val = 3000 + Math.random() * 1000;
          if (j === 2) val = 0;
          if (j === 3) val = 0;
          if (j === 4) val = 0;
        }
        
        row.push(val);
      }
      rows.push(row);
    }
    return rows;
  };

const sendWindow = async (startIdx) => {
    const data = dataRef.current;
    if (startIdx + WINDOW > data.length) return;
    
    const window = data.slice(startIdx, startIdx + WINDOW).map(row => row.slice(1));
    
    // ================================================================
    // LOG THE DATA TO SEE IF ANOMALIES ARE THERE
    // ================================================================
    console.log('Window data:', window);
    console.log('Window values for sensor 0:', window.map(row => row[0]));
    
    setSensorData(window);
    setProgress((startIdx / (data.length - WINDOW)) * 100);
    // ... rest of code
    try {
      setIsLoading(true);
      setStatus('analyzing');
      const result = await predictAnomaly(window);
      setPredictionResult(result);
      
      const isAnomaly = result.hybrid?.is_anomaly || false;
      const score = result.hybrid?.combined_score || 0;
      
      const lastRow = data[startIdx + WINDOW - 1];
      const timestamp = lastRow[0];
      
      setHistory(prev => [...prev.slice(-200), {
        timestamp: timestamp,
        score: score,
        isAnomaly: isAnomaly,
        ifScore: result.isolation_forest?.score || 0,
        lstmScore: result.lstm?.normalized_score || 0,
      }]);
      
      if (isAnomaly) {
        setAnomalyLogs(prev => [{
          timestamp: timestamp,
          score: score,
          ifScore: result.isolation_forest?.score || 0,
          lstmScore: result.lstm?.normalized_score || 0,
        }, ...prev.slice(0, 99)]);
      }
      
      setStatus('idle');
      setError(null);
    } catch (err) {
      setError(err.message || 'Prediction failed');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const startStreaming = async () => {
    if (isRunning) return;
    if (backendStatus === 'offline') {
      setError('Cannot start: Backend is offline');
      return;
    }
    
    if (!dataRef.current.length) {
      setStatus('generating');
      dataRef.current = generateData();
      setTotalRows(dataRef.current.length);
      indexRef.current = 0;
      setProgress(0);
      setStatus('idle');
    }
    setIsRunning(true);
    setError(null);
    await sendWindow(indexRef.current);
    
    intervalRef.current = setInterval(async () => {
      indexRef.current += 1;
      
      if (indexRef.current + WINDOW > dataRef.current.length) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
        setStatus('idle');
        setError('✅ Completed streaming through entire dataset');
        return;
      }
      
      await sendWindow(indexRef.current);
    }, UPDATE_INTERVAL);
  };

  const stopStreaming = () => {
    setIsRunning(false);
    setStatus('idle');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetData = () => {
    stopStreaming();
    dataRef.current = [];
    setTotalRows(0);
    setProgress(0);
    setHistory([]);
    setAnomalyLogs([]);
    setSensorData([]);
    setPredictionResult(null);
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        <Chip 
          label={backendStatus === 'online' ? '✅ Backend Online' : '❌ Backend Offline'}
          color={backendStatus === 'online' ? 'success' : 'error'}
          size="small"
        />
        <Chip label={`📊 ${totalRows || 0} rows`} size="small" />
        {isRunning && (
          <Chip label={`⏱️ ${UPDATE_INTERVAL/1000}s interval`} size="small" />
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color={isRunning ? 'error' : 'primary'}
          startIcon={isRunning ? <StopIcon /> : <PlayArrowIcon />}
          onClick={isRunning ? stopStreaming : startStreaming}
          disabled={status === 'generating' || backendStatus === 'offline'}
          sx={{ flex: 2, py: 1.5 }}
        >
          {isRunning ? 'Stop Streaming' : 'Start Streaming'}
        </Button>
        
        <Button
          variant="outlined"
          color="secondary"
          onClick={resetData}
          disabled={isRunning}
          sx={{ flex: 1 }}
        >
          Reset
        </Button>
      </Box>
      
      {status === 'generating' && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Generating simulation data...
        </Typography>
      )}
      
      {totalRows > 0 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="textSecondary">
              Progress: {progress.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {Math.round(progress / 100 * totalRows).toLocaleString()} / {totalRows.toLocaleString()} rows
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 4, borderRadius: 2, mt: 0.5 }} 
          />
        </Box>
      )}

      {error && (
        <Alert severity={error.includes('✅') ? 'success' : 'error'} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {history.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="textSecondary">
            Samples: {history.length}
          </Typography>
          <Typography variant="caption" color="error">
            Anomalies: {history.filter(h => h.isAnomaly).length}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Last: {(history[history.length-1]?.score || 0).toFixed(3)}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Updated: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DataStreamer;