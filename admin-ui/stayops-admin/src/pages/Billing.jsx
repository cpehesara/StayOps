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

const Billing = () => {
  const invoices = [
    { id: 'INV001', guest: 'John Doe', room: '101', amount: '$450', status: 'Paid' },
    { id: 'INV002', guest: 'Jane Smith', room: '202', amount: '$680', status: 'Pending' },
    { id: 'INV003', guest: 'Bob Johnson', room: '305', amount: '$1200', status: 'Paid' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Billing & Invoices
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice ID</TableCell>
              <TableCell>Guest</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.guest}</TableCell>
                <TableCell>{invoice.room}</TableCell>
                <TableCell>{invoice.amount}</TableCell>
                <TableCell>
                  <Chip 
                    label={invoice.status} 
                    color={invoice.status === 'Paid' ? 'success' : 'warning'}
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

export default Billing;
