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
  Paper 
} from '@mui/material';

const Guests = () => {
  const guests = [
    { id: 'G001', name: 'John Doe', email: 'john@example.com', phone: '+1-555-0101', room: '101' },
    { id: 'G002', name: 'Jane Smith', email: 'jane@example.com', phone: '+1-555-0102', room: '202' },
    { id: 'G003', name: 'Bob Johnson', email: 'bob@example.com', phone: '+1-555-0103', room: '305' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Guest Management
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Guest ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Room</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {guests.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell>{guest.id}</TableCell>
                <TableCell>{guest.name}</TableCell>
                <TableCell>{guest.email}</TableCell>
                <TableCell>{guest.phone}</TableCell>
                <TableCell>{guest.room}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Guests;
