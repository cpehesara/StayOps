import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Paper,
  Chip 
} from '@mui/material';

const GuestRequests = () => {
  const requests = [
    { id: 1, guest: 'John Doe', room: '101', request: 'Extra towels', status: 'Pending' },
    { id: 2, guest: 'Jane Smith', room: '202', request: 'Room service', status: 'In Progress' },
    { id: 3, guest: 'Bob Johnson', room: '305', request: 'Late checkout', status: 'Completed' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Guest Requests
      </Typography>
      
      <Paper sx={{ mt: 3 }}>
        <List>
          {requests.map((request) => (
            <ListItem key={request.id} divider>
              <ListItemText
                primary={`${request.guest} - Room ${request.room}`}
                secondary={request.request}
              />
              <Chip 
                label={request.status} 
                color={request.status === 'Completed' ? 'success' : 'default'}
                size="small"
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default GuestRequests;
