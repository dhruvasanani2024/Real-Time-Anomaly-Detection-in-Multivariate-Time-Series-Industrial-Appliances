import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAppContext } from '../../context/AppContext';

const ManualInput = () => {
  const { setSensorData, setError } = useAppContext();
  const [inputText, setInputText] = useState('');

  const handleSubmit = () => {
    try {
      const parsed = JSON.parse(inputText);
      if (Array.isArray(parsed) && parsed.length >= 30 && parsed[0]?.length === 51) {
        setSensorData(parsed.slice(0, 30));
        setError(null);
      } else {
        setError('Invalid format. Need 30×51 array');
      }
    } catch {
      setError('Invalid JSON format');
    }
  };

  return (
    <Box>
      <TextField
        multiline
        rows={4}
        fullWidth
        placeholder='[[0.0, 124.3, ...], ...]'
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        sx={{ mb: 1 }}
      />
      <Button
        variant="outlined"
        fullWidth
        onClick={handleSubmit}
      >
        Load Data
      </Button>
    </Box>
  );
};

export default ManualInput;