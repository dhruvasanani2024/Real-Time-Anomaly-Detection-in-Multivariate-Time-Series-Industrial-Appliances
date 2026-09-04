import React from 'react';
import { Paper, Typography, Box, LinearProgress } from '@mui/material';

const StatusCard = ({ title, value, threshold, isAnomaly, large }) => {
  const percentage = Math.min((value || 0) * 100, 100);
  const isRed = isAnomaly || (threshold && value > threshold);

  if (large) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', background: isRed ? 'linear-gradient(135deg, #1a0a0a, #2a0a0a)' : 'linear-gradient(135deg, #0a1a0a, #0a2a0a)' }}>
        <Typography variant="body2" color="textSecondary">{title}</Typography>
        <Typography variant="h2" color={isRed ? 'error' : 'primary'} sx={{ fontWeight: 'bold', my: 1 }}>
          {(value || 0).toFixed(3)}
        </Typography>
        <Box sx={{ width: '100%', mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={isRed ? 'error' : 'primary'}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
        {threshold && (
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Threshold: {threshold.toFixed(3)}
          </Typography>
        )}
        <Typography variant="caption" color={isRed ? 'error' : 'success'} sx={{ mt: 1, display: 'block', fontWeight: 'bold' }}>
          {isRed ? '⚠️ ANOMALY DETECTED' : '✅ NORMAL'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="caption" color="textSecondary">{title}</Typography>
      <Typography variant="h5" color={isRed ? 'error' : 'primary'} sx={{ fontWeight: 'bold' }}>
        {(value || 0).toFixed(3)}
      </Typography>
      <Box sx={{ width: '100%', mt: 1 }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={isRed ? 'error' : 'primary'}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>
      <Typography variant="caption" color={isRed ? 'error' : 'success'} sx={{ display: 'block', mt: 0.5 }}>
        {isRed ? '⚠️ Anomaly' : '✅ Normal'}
      </Typography>
    </Paper>
  );
};

export default StatusCard;