import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Switch } from '@mui/material';

const Security = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Security Settings
      </Typography>
      
      <Paper sx={{ mt: 3 }}>
        <List>
          <ListItem>
            <ListItemText
              primary="Two-Factor Authentication"
              secondary="Add an extra layer of security to your account"
            />
            <Switch />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary="Access Logs"
              secondary="Monitor login activity and access patterns"
            />
            <Switch defaultChecked />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary="Automatic Session Timeout"
              secondary="Auto-logout after 30 minutes of inactivity"
            />
            <Switch defaultChecked />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default Security;
