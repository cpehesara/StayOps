import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper } from '@mui/material';

const Reporting = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Occupancy Rate
              </Typography>
              <Typography variant="h3" color="primary">
                78%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue This Month
              </Typography>
              <Typography variant="h3" color="success.main">
                $42,500
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Report Options
        </Typography>
        <Typography color="text.secondary">
          Generate custom reports for occupancy, revenue, guest satisfaction, and more.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Reporting;
