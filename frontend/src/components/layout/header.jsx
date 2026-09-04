import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAppContext } from '../../context/AppContext';

const Header = () => {
  const { predictionResult } = useAppContext();
  const isAnomaly = predictionResult?.hybrid?.is_anomaly || false;

  return (
    <AppBar position="fixed" sx={{ zIndex: 1201 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          🔥 SWaT Anomaly Detection
        </Typography>
        
        {/* Status Indicator */}
        <Badge
          color={isAnomaly ? 'error' : 'success'}
          variant="dot"
          sx={{ mr: 2 }}
        >
          <Typography variant="body2" sx={{ mr: 1 }}>
            {isAnomaly ? '⚠️ Anomaly Detected' : '✅ Normal'}
          </Typography>
        </Badge>

        <IconButton color="inherit">
          <Badge badgeContent={isAnomaly ? 1 : 0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;