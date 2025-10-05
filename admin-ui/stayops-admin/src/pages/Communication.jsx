import React from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';

const Communication = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Guest Communication
      </Typography>
      
      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Send Message to Guests
        </Typography>
        
        <TextField
          fullWidth
          label="Recipient"
          placeholder="Select guest or room"
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Subject"
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Message"
          multiline
          rows={6}
          sx={{ mb: 2 }}
        />
        
        <Button variant="contained">
          Send Message
        </Button>
      </Paper>
    </Box>
  );
};

export default Communication;
