import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  TextField, 
  Button 
} from '@mui/material';

const CheckInOut = () => {
  const [tab, setTab] = useState(0);
  const [guestId, setGuestId] = useState('');

  const handleCheckIn = () => {
    console.log('Check-in for guest:', guestId);
    // Add API call
  };

  const handleCheckOut = () => {
    console.log('Check-out for guest:', guestId);
    // Add API call
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Check-In / Check-Out
      </Typography>
      
      <Card sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          <Tab label="Check-In" />
          <Tab label="Check-Out" />
        </Tabs>
        
        <CardContent>
          <TextField
            fullWidth
            label="Guest ID or Reservation Number"
            value={guestId}
            onChange={(e) => setGuestId(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          {tab === 0 ? (
            <Button 
              variant="contained" 
              onClick={handleCheckIn}
              disabled={!guestId}
            >
              Check-In Guest
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="secondary"
              onClick={handleCheckOut}
              disabled={!guestId}
            >
              Check-Out Guest
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CheckInOut;
