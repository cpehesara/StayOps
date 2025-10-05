import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper } from '@mui/material';
import { People, Hotel, CheckCircle, AttachMoney } from '@mui/icons-material';

const ReceptionistDashboard = () => {
  const stats = [
    { title: 'Total Guests', value: 45, icon: <People />, color: '#1976d2' },
    { title: 'Available Rooms', value: 12, icon: <Hotel />, color: '#2e7d32' },
    { title: 'Check-ins Today', value: 8, icon: <CheckCircle />, color: '#ed6c02' },
    { title: 'Revenue Today', value: '$4,250', icon: <AttachMoney />, color: '#9c27b0' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ bgcolor: stat.color, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {stat.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Typography color="text.secondary">
          No recent activity to display
        </Typography>
      </Paper>
    </Box>
  );
};

export default ReceptionistDashboard;
