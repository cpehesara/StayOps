import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

import { fetchHotels, addHotel, deleteHotel } from "../api/hotel";

const AdminHotelManagement = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
  });

  const loadHotels = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchHotels();
      // Ensure data is always an array
      setHotels(Array.isArray(data) ? data : []);
      setSuccess("Hotels loaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setError("Failed to load hotels. Please try again.");
      setHotels([]); // Ensure hotels is always an array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const handleOpen = () => setOpen(true);
  
  const handleClose = () => {
    setOpen(false);
    setFormData({ 
      name: "", 
      address: "", 
      phone: "", 
      email: "", 
      description: "" 
    });
    setError("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Hotel name is required");
      return false;
    }
    if (!formData.address.trim()) {
      setError("Address is required");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleAddHotel = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    try {
      await addHotel(formData);
      await loadHotels();
      handleClose();
      setSuccess("Hotel added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding hotel:", error);
      setError("Failed to add hotel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (hotelId) => {
    navigate(`/admin/hotels/${hotelId}`);
  };

  const handleEditHotel = (hotelId) => {
    navigate(`/admin/hotels/${hotelId}/edit`);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      await deleteHotel(id);
      await loadHotels();
      setSuccess("Hotel deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting hotel:", error);
      setError("Failed to delete hotel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4} sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" sx={{ color: "black", fontWeight: "bold" }}>
          Hotel Management System
        </Typography>
        <IconButton 
          onClick={loadHotels} 
          disabled={loading}
          sx={{ color: "black" }}
          title="Refresh hotels"
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, color: "black" }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2, color: "black" }}>
          {success}
        </Alert>
      )}

      <Box mb={3}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          disabled={loading}
          sx={{ 
            backgroundColor: "black", 
            color: "white",
            '&:hover': { backgroundColor: "#333" },
            '&:disabled': { backgroundColor: "#ccc" }
          }}
        >
          Add New Hotel
        </Button>
      </Box>

      {loading && !open ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress sx={{ color: "black" }} />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ 
            border: "2px solid black", 
            borderRadius: 2,
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
              <TableRow>
                <TableCell sx={{ color: "black", fontWeight: "bold", fontSize: "1.1rem" }}>
                  ID
                </TableCell>
                <TableCell sx={{ color: "black", fontWeight: "bold", fontSize: "1.1rem" }}>
                  Hotel Name
                </TableCell>
                <TableCell sx={{ color: "black", fontWeight: "bold", fontSize: "1.1rem" }}>
                  Address
                </TableCell>
                <TableCell sx={{ color: "black", fontWeight: "bold", fontSize: "1.1rem" }}>
                  Phone
                </TableCell>
                <TableCell sx={{ color: "black", fontWeight: "bold", fontSize: "1.1rem" }}>
                  Email
                </TableCell>
                <TableCell sx={{ color: "black", fontWeight: "bold", fontSize: "1.1rem" }}>
                  Description
                </TableCell>
                <TableCell sx={{ color: "black", fontWeight: "bold", fontSize: "1.1rem", textAlign: "center" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hotels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", color: "black", py: 4 }}>
                    <Typography variant="h6">No hotels found</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Add your first hotel using the button above
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                hotels.map((hotel) => (
                  <TableRow 
                    key={hotel.hotel_id || hotel.id} 
                    sx={{ 
                      '&:hover': { backgroundColor: "#f5f5f5" },
                      '&:nth-of-type(even)': { backgroundColor: "#fafafa" }
                    }}
                  >
                    <TableCell sx={{ color: "black", fontWeight: "medium" }}>
                      {hotel.hotel_id || hotel.id}
                    </TableCell>
                    <TableCell sx={{ color: "black", fontWeight: "medium", cursor: "pointer" }}
                      onClick={() => handleViewDetails(hotel.hotel_id || hotel.id)}
                      title="Click to view details"
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: "black", 
                          fontWeight: "bold",
                          '&:hover': { textDecoration: "underline" }
                        }}
                      >
                        {hotel.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "black", maxWidth: 200 }}>
                      <Typography variant="body2" noWrap title={hotel.address}>
                        {hotel.address}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "black" }}>
                      {hotel.phone}
                    </TableCell>
                    <TableCell sx={{ color: "black" }}>
                      {hotel.email}
                    </TableCell>
                    <TableCell sx={{ color: "black", maxWidth: 200 }}>
                      <Typography variant="body2" noWrap title={hotel.description}>
                        {hotel.description || "No description"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Box display="flex" justifyContent="center" gap={1}>
                        <IconButton
                          onClick={() => handleViewDetails(hotel.hotel_id || hotel.id)}
                          sx={{ 
                            color: "black",
                            '&:hover': { backgroundColor: "#e3f2fd" }
                          }}
                          title="View details"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        
                        <IconButton
                          onClick={() => handleEditHotel(hotel.hotel_id || hotel.id)}
                          sx={{ 
                            color: "black",
                            '&:hover': { backgroundColor: "#f3e5f5" }
                          }}
                          title="Edit hotel"
                        >
                          <EditIcon />
                        </IconButton>
                        
                        <IconButton
                          onClick={() => handleDelete(hotel.hotel_id || hotel.id, hotel.name)}
                          disabled={loading}
                          sx={{ 
                            color: "black",
                            '&:hover': { backgroundColor: "#ffebee" }
                          }}
                          title="Delete hotel"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Hotel Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { border: "2px solid black", borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ color: "black", fontWeight: "bold", fontSize: "1.5rem" }}>
          Add New Hotel
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, color: "black" }}>
              {error}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Hotel Name *"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            InputLabelProps={{ style: { color: "black" } }}
            InputProps={{ 
              style: { color: "black" },
              sx: { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' } }
            }}
          />
          
          <TextField
            margin="dense"
            label="Address *"
            name="address"
            fullWidth
            multiline
            rows={2}
            value={formData.address}
            onChange={handleChange}
            disabled={loading}
            InputLabelProps={{ style: { color: "black" } }}
            InputProps={{ 
              style: { color: "black" },
              sx: { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' } }
            }}
          />
          
          <TextField
            margin="dense"
            label="Phone Number *"
            name="phone"
            fullWidth
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            InputLabelProps={{ style: { color: "black" } }}
            InputProps={{ 
              style: { color: "black" },
              sx: { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' } }
            }}
          />
          
          <TextField
            margin="dense"
            label="Email Address *"
            name="email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            InputLabelProps={{ style: { color: "black" } }}
            InputProps={{ 
              style: { color: "black" },
              sx: { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' } }
            }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            InputLabelProps={{ style: { color: "black" } }}
            InputProps={{ 
              style: { color: "black" },
              sx: { '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' } }
            }}
          />
          
          <Typography variant="caption" sx={{ color: "black", mt: 1, display: "block" }}>
            * Required fields
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{ 
              color: "black", 
              borderColor: "black",
              '&:hover': { backgroundColor: "#f0f0f0" }
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddHotel} 
            disabled={loading}
            sx={{ 
              backgroundColor: "black", 
              color: "white",
              '&:hover': { backgroundColor: "#333" },
              '&:disabled': { backgroundColor: "#ccc" }
            }}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
          >
            {loading ? "Adding..." : "Add Hotel"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminHotelManagement;