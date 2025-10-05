import React from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip 
} from '@mui/material';

const Reservations = () => {
  const reservations = [
    { id: 'RES001', guest: 'John Doe', room: '101', checkIn: '2025-10-06', checkOut: '2025-10-10', status: 'Confirmed' },
    { id: 'RES002', guest: 'Jane Smith', room: '202', checkIn: '2025-10-07', checkOut: '2025-10-12', status: 'Pending' },
    { id: 'RES003', guest: 'Bob Johnson', room: '305', checkIn: '2025-10-05', checkOut: '2025-10-08', status: 'Checked-In' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reservations
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reservation ID</TableCell>
              <TableCell>Guest</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Check-In</TableCell>
              <TableCell>Check-Out</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((res) => (
              <TableRow key={res.id}>
                <TableCell>{res.id}</TableCell>
                <TableCell>{res.guest}</TableCell>
                <TableCell>{res.room}</TableCell>
                <TableCell>{res.checkIn}</TableCell>
                <TableCell>{res.checkOut}</TableCell>
                <TableCell>
                  <Chip 
                    label={res.status} 
                    color={res.status === 'Confirmed' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Reservations;
