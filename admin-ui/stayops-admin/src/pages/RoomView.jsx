import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';

const RoomView = () => {
  const rooms = [
    { id: 101, type: 'Single', status: 'Available', floor: 1 },
    { id: 102, type: 'Double', status: 'Occupied', floor: 1 },
    { id: 103, type: 'Suite', status: 'Cleaning', floor: 1 },
    { id: 201, type: 'Single', status: 'Available', floor: 2 },
    { id: 202, type: 'Double', status: 'Maintenance', floor: 2 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'success';
      case 'Occupied': return 'error';
      case 'Cleaning': return 'warning';
      case 'Maintenance': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Room Management
      </Typography>
      
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={room.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Room {room.id}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {room.type} - Floor {room.floor}
                </Typography>
                <Chip 
                  label={room.status} 
                  color={getStatusColor(room.status)}
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RoomView;
