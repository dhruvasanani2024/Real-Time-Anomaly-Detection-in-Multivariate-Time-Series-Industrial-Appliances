import React from 'react';
import { Container, Grid, Paper, Typography, Box, Divider, List, ListItem, ListItemText, Chip, Avatar } from '@mui/material';
import { useAppContext } from '../../context/AppContext';
import StatusCard from './StatusCard';
import AnomalyAlert from './AnomalyAlert';
import RealtimeChart from './RealtimeChart';
import DataStreamer from '../Simulator/DataStreamer';

const Dashboard = () => {
  const { 
    sensorData, 
    predictionResult, 
    error, 
    history, 
    anomalyLogs 
  } = useAppContext();

  const latestResult = predictionResult?.hybrid;
  const isAnomaly = latestResult?.is_anomaly || false;

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4, px: { xs: 1, sm: 2, md: 3 } }}>
      
      {/* Top Header Bar */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, background: isAnomaly ? 'linear-gradient(135deg, #1a0a0a, #2a0a0a)' : 'linear-gradient(135deg, #0a1a0a, #0a2a0a)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', md: '2rem' } }}>
              🔥 SWaT Anomaly Detection
            </Typography>
            <Chip 
              label={isAnomaly ? '🚨 ANOMALY' : '✅ NORMAL'}
              color={isAnomaly ? 'error' : 'success'}
              size="large"
              sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" color="textSecondary">
              📊 Samples: {history.length}
            </Typography>
            <Typography variant="body2" color="error">
              ⚠️ Anomalies: {history.filter(h => h.isAnomaly).length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              ⏱️ {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Alert Banner */}
      {isAnomaly && <AnomalyAlert result={predictionResult} />}

      {/* Main Grid - 2 Columns */}
      <Grid container spacing={3}>
        
        {/* LEFT COLUMN - Controls & Stats */}
        <Grid item xs={12} md={3}>
          
          {/* Data Stream Control */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
              📡 Data Stream
            </Typography>
            <DataStreamer />
            {error && (
              <Typography color="error" sx={{ mt: 2, fontSize: '0.875rem' }}>
                Error: {error}
              </Typography>
            )}
          </Paper>

          {/* Score Cards - Horizontal Row */}
          {predictionResult && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <StatusCard
                  title="🎯 Hybrid Score"
                  value={predictionResult.hybrid?.combined_score || 0}
                  threshold={0.5}
                  large
                />
              </Grid>
              <Grid item xs={6}>
                <StatusCard
                  title="🌲 Isolation Forest"
                  value={predictionResult.isolation_forest?.score || 0}
                  isAnomaly={predictionResult.isolation_forest?.is_anomaly}
                />
              </Grid>
              <Grid item xs={6}>
                <StatusCard
                  title="🧠 LSTM"
                  value={predictionResult.lstm?.normalized_score || 0}
                  isAnomaly={predictionResult.lstm?.is_anomaly}
                />
              </Grid>
            </Grid>
          )}

          {/* Statistics */}
          {history.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>📊 Statistics</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{history.length}</Typography>
                  <Typography variant="caption" color="textSecondary">Total</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="error">{history.filter(h => h.isAnomaly).length}</Typography>
                  <Typography variant="caption" color="textSecondary">Anomalies</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">
                    {(history.filter(h => h.isAnomaly).length / history.length * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">Rate</Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* RIGHT COLUMN - Chart & Logs */}
        <Grid item xs={12} md={9}>
          
          {/* Chart */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                📈 Live Sensor Data
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Updates every 5 seconds
              </Typography>
            </Box>
            {sensorData?.length > 0 ? (
              <RealtimeChart data={sensorData} result={predictionResult} history={history} />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                <Typography color="textSecondary">Click "Start Streaming" to begin</Typography>
              </Box>
            )}
          </Paper>

          {/* Anomaly Logs - Horizontal Scroll */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
              📋 Anomaly Logs
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {anomalyLogs?.length === 0 || !anomalyLogs ? (
              <Typography color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                No anomalies detected yet
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {anomalyLogs.slice(0, 20).map((log, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      py: 1,
                      px: 2,
                      borderBottom: '1px solid #1a1a1a',
                      '&:hover': { bgcolor: 'rgba(255,0,0,0.05)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'error.main', fontSize: '0.75rem' }}>
                        🚨
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
                          Anomaly Detected
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          IF: {log.ifScore?.toFixed(3) || '0.000'} | LSTM: {log.lstmScore?.toFixed(3) || '0.000'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="error" sx={{ fontWeight: 'bold' }}>
                        Score: {log.score?.toFixed(3) || '0.000'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;