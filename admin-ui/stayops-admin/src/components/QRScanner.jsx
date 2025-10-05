import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Alert 
} from '@mui/material';
import { QrCode } from 'lucide-react';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  const handleStartScan = () => {
    setScanning(true);
    // Placeholder for QR scanner implementation
    setTimeout(() => {
      setScannedData({ guestId: '12345', name: 'John Doe' });
      setScanning(false);
    }, 2000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        QR Code Scanner
      </Typography>
      
      <Card sx={{ mt: 3, maxWidth: 600 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <QrCode size={64} style={{ margin: '0 auto', color: '#1976d2' }} />
            <Typography variant="h6" sx={{ mt: 2, mb: 3 }}>
              Scan Guest QR Code
            </Typography>
            
            {scanning ? (
              <Alert severity="info">Scanning...</Alert>
            ) : scannedData ? (
              <Alert severity="success">
                Guest Found: {scannedData.name} (ID: {scannedData.guestId})
              </Alert>
            ) : (
              <Button 
                variant="contained" 
                onClick={handleStartScan}
                size="large"
              >
                Start Scanner
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default QRScanner;
