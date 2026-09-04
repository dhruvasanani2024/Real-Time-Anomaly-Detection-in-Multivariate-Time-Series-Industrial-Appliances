import React from 'react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Papa from 'papaparse';
import { useAppContext } from '../../context/AppContext';

const FileUpload = () => {
  const { setSensorData, setError } = useAppContext();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        try {
          // Parse CSV to 30×51 array
          const data = results.data
            .filter(row => row.length > 0)
            .map(row => row.map(Number))
            .filter(row => row.every(v => !isNaN(v)));

          if (data.length >= 30 && data[0].length >= 51) {
            setSensorData(data.slice(0, 30));
            setError(null);
          } else {
            setError('CSV must have at least 30 rows and 51 columns');
          }
        } catch (err) {
          setError('Failed to parse CSV: ' + err.message);
        }
      },
      error: (err) => {
        setError('Failed to read file: ' + err.message);
      },
    });
  };

  return (
    <Button
      component="label"
      variant="outlined"
      startIcon={<CloudUploadIcon />}
      fullWidth
    >
      Upload CSV
      <input
        type="file"
        accept=".csv"
        hidden
        onChange={handleFileUpload}
      />
    </Button>
  );
};

export default FileUpload;