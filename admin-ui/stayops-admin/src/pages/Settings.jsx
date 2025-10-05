import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Switch, TextField, Button } from '@mui/material';

const Settings = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>
      
      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          General Settings
        </Typography>
        
        <TextField
          fullWidth
          label="Hotel Name"
          defaultValue="StayOps Hotel"
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Contact Email"
          type="email"
          defaultValue="info@stayops.com"
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Phone Number"
          defaultValue="+1-555-0100"
          sx={{ mb: 3 }}
        />
        
        <Button variant="contained">
          Save Settings
        </Button>
      </Paper>

      <Paper sx={{ mt: 3 }}>
        <List>
          <ListItem>
            <ListItemText
              primary="Email Notifications"
              secondary="Receive email alerts for new bookings and check-ins"
            />
            <Switch defaultChecked />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary="SMS Notifications"
              secondary="Receive SMS alerts for urgent requests"
            />
            <Switch />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default Settings;
