import React from 'react';
import { Alert, AlertTitle, Box, Chip } from '@mui/material';

const AnomalyAlert = ({ result }) => {
  const score = result?.hybrid?.combined_score || 0;
  const ifScore = result?.isolation_forest?.score || 0;
  const lstmScore = result?.lstm?.normalized_score || 0;

  return (
    <Alert severity="error" variant="filled" sx={{ mb: 3 }}>
      <AlertTitle>🚨 ANOMALY DETECTED!</AlertTitle>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Chip label={`Score: ${score.toFixed(3)}`} color="error" size="small" />
        <Chip label={`IF: ${ifScore.toFixed(3)}`} color="warning" size="small" />
        <Chip label={`LSTM: ${lstmScore.toFixed(3)}`} color="info" size="small" />
      </Box>
    </Alert>
  );
};

export default AnomalyAlert;