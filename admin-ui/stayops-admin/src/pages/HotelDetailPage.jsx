import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Rating,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Snackbar,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Wifi as WifiIcon,
  Restaurant as RestaurantIcon,
  Pool as PoolIcon,
  FitnessCenter as FitnessCenterIcon,
  LocalParking as ParkingIcon,
  RoomService as RoomServiceIcon,
  Business as BusinessIcon,
  Pets as PetsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import { getHotelById, deleteHotel } from "../api/hotel";
import { 
  getAllAmenities, 
  getHotelAmenities, 
  getAvailableAmenitiesForHotel,
  createAmenity, 
  addAmenityToHotel,
  removeAmenityFromHotel,
  deleteAmenity 
} from "../api/amenity";

const HotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Amenities state
  const [hotelAmenities, setHotelAmenities] = useState([]);
  const [availableAmenities, setAvailableAmenities] = useState([]);
  const [allAmenities, setAllAmenities] = useState([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);
  const [amenityDialogOpen, setAmenityDialogOpen] = useState(false);
  const [addAmenityDialogOpen, setAddAmenityDialogOpen] = useState(false);
  const [newAmenity, setNewAmenity] = useState({
    name: "",
    icon: "",
    available: true
  });
  const [selectedAmenityToAdd, setSelectedAmenityToAdd] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Mock data for demonstration - in real app, these would come from separate API calls
  const [rooms] = useState([
    { type: "Standard Room", count: 25, price: 89, available: 18 },
    { type: "Deluxe Room", count: 15, price: 129, available: 12 },
    { type: "Suite", count: 8, price: 199, available: 5 },
    { type: "Executive Suite", count: 4, price: 299, available: 2 },
  ]);

  const [reviews] = useState([
    { guest: "John D.", rating: 4, comment: "Great service and clean rooms!", date: "2024-01-15" },
    { guest: "Sarah M.", rating: 5, comment: "Excellent location and friendly staff.", date: "2024-01-10" },
    { guest: "Mike R.", rating: 4, comment: "Good value for money. Will come back!", date: "2024-01-08" },
  ]);

  // Icon mapping for amenities
  const iconMap = {
    wifi: <WifiIcon />,
    restaurant: <RestaurantIcon />,
    pool: <PoolIcon />,
    fitness: <FitnessCenterIcon />,
    parking: <ParkingIcon />,
    roomservice: <RoomServiceIcon />,
    business: <BusinessIcon />,
    pets: <PetsIcon />,
  };

  const iconOptions = [
    { value: "wifi", label: "WiFi", icon: <WifiIcon /> },
    { value: "restaurant", label: "Restaurant", icon: <RestaurantIcon /> },
    { value: "pool", label: "Pool", icon: <PoolIcon /> },
    { value: "fitness", label: "Fitness Center", icon: <FitnessCenterIcon /> },
    { value: "parking", label: "Parking", icon: <ParkingIcon /> },
    { value: "roomservice", label: "Room Service", icon: <RoomServiceIcon /> },
    { value: "business", label: "Business Center", icon: <BusinessIcon /> },
    { value: "pets", label: "Pet Friendly", icon: <PetsIcon /> },
  ];

  useEffect(() => {
    loadHotelDetails();
    loadHotelAmenities();
  }, [id]);

  const loadHotelDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getHotelById(id);
      setHotel(data);
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      setError("Failed to load hotel details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadHotelAmenities = async () => {
    setAmenitiesLoading(true);
    try {
      const hotelAmenitiesData = await getHotelAmenities(id);
      setHotelAmenities(hotelAmenitiesData);
    } catch (error) {
      console.error("Error fetching hotel amenities:", error);
      setSnackbar({
        open: true,
        message: "Failed to load hotel amenities",
        severity: "error"
      });
    } finally {
      setAmenitiesLoading(false);
    }
  };

  const loadAvailableAmenities = async () => {
    try {
      const available = await getAvailableAmenitiesForHotel(id);
      setAvailableAmenities(available);
      
      const all = await getAllAmenities();
      setAllAmenities(all);
    } catch (error) {
      console.error("Error fetching available amenities:", error);
      setSnackbar({
        open: true,
        message: "Failed to load available amenities",
        severity: "error"
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${hotel.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteHotel(id);
      navigate("/admin/hotels");
    } catch (error) {
      console.error("Error deleting hotel:", error);
      setError("Failed to delete hotel. Please try again.");
    }
  };

  const handleEdit = () => {
    navigate(`/admin/hotels/${id}/edit`);
  };

  const handleCreateAmenity = async () => {
    if (!newAmenity.name.trim()) {
      setSnackbar({
        open: true,
        message: "Amenity name is required",
        severity: "error"
      });
      return;
    }

    try {
      const createdAmenity = await createAmenity(newAmenity);
      setAllAmenities([...allAmenities, createdAmenity]);
      setAmenityDialogOpen(false);
      setNewAmenity({ name: "", icon: "", available: true });
      setSnackbar({
        open: true,
        message: "Amenity created successfully",
        severity: "success"
      });
      // Refresh available amenities
      loadAvailableAmenities();
    } catch (error) {
      console.error("Error creating amenity:", error);
      setSnackbar({
        open: true,
        message: "Failed to create amenity",
        severity: "error"
      });
    }
  };

  const handleAddAmenityToHotel = async () => {
    if (!selectedAmenityToAdd) {
      setSnackbar({
        open: true,
        message: "Please select an amenity",
        severity: "error"
      });
      return;
    }

    try {
      await addAmenityToHotel(id, selectedAmenityToAdd);
      setAddAmenityDialogOpen(false);
      setSelectedAmenityToAdd("");
      setSnackbar({
        open: true,
        message: "Amenity added to hotel successfully",
        severity: "success"
      });
      // Refresh hotel amenities
      loadHotelAmenities();
    } catch (error) {
      console.error("Error adding amenity to hotel:", error);
      setSnackbar({
        open: true,
        message: "Failed to add amenity to hotel",
        severity: "error"
      });
    }
  };

  const handleRemoveAmenityFromHotel = async (amenityId) => {
    if (!window.confirm("Are you sure you want to remove this amenity from the hotel?")) {
      return;
    }

    try {
      await removeAmenityFromHotel(id, amenityId);
      setSnackbar({
        open: true,
        message: "Amenity removed from hotel successfully",
        severity: "success"
      });
      // Refresh hotel amenities
      loadHotelAmenities();
    } catch (error) {
      console.error("Error removing amenity from hotel:", error);
      setSnackbar({
        open: true,
        message: "Failed to remove amenity from hotel",
        severity: "error"
      });
    }
  };

  const handleOpenAddAmenityDialog = () => {
    loadAvailableAmenities();
    setAddAmenityDialogOpen(true);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: "#000000" }} size={60} />
      </Box>
    );
  }

  if (error || !hotel) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Hotel not found"}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/hotel-management")}
          sx={{ color: "#000000", borderColor: "#000000" }}
        >
          Back to Hotels
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh", pb: 4 }}>
      {/* Header Section */}
      <Box sx={{ backgroundColor: "#ffffff", borderBottom: "2px solid #000000", p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link 
            onClick={() => navigate("/hotel-management")}
            sx={{ 
              cursor: "pointer", 
              textDecoration: "underline",
              color: "#000000",
              '&:hover': { color: "#333333" }
            }}
          >
            Hotels
          </Link>
          <Typography sx={{ color: "#000000", fontWeight: "bold" }}>
            {hotel.name}
          </Typography>
        </Breadcrumbs>

        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h3" sx={{ color: "#000000", fontWeight: "bold", mb: 1 }}>
              {hotel.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Rating value={parseFloat(calculateAverageRating())} readOnly sx={{ color: "#000000" }} />
              <Typography variant="body1" sx={{ color: "#000000" }}>
                {calculateAverageRating()} ({reviews.length} reviews)
              </Typography>
              <Chip 
                label={`Hotel ID: ${hotel.hotel_id || hotel.id}`} 
                sx={{ backgroundColor: "#000000", color: "#ffffff" }} 
              />
            </Box>
          </Box>

          {/* Admin Actions */}
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ color: "#000000", borderColor: "#000000" }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              sx={{ color: "#dc3545", borderColor: "#dc3545" }}
            >
              Delete
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/hotel-management")}
              sx={{ color: "#000000", borderColor: "#000000" }}
            >
              Back
            </Button>
          </Box>
        </Box>
      </Box>

      <Box p={4}>
        <Grid container spacing={4}>
          {/* Basic Information */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, border: "2px solid #000000", borderRadius: 2, mb: 4 }}>
              <Typography variant="h5" sx={{ color: "#000000", fontWeight: "bold", mb: 3 }}>
                Hotel Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <LocationIcon sx={{ color: "#000000", mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" sx={{ color: "#000000", fontWeight: "bold" }}>
                        Address
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#000000" }}>
                        {hotel.address}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <PhoneIcon sx={{ color: "#000000" }} />
                    <Box>
                      <Typography variant="h6" sx={{ color: "#000000", fontWeight: "bold" }}>
                        Phone
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#000000" }}>
                        {hotel.phone}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <EmailIcon sx={{ color: "#000000" }} />
                    <Box>
                      <Typography variant="h6" sx={{ color: "#000000", fontWeight: "bold" }}>
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#000000" }}>
                        {hotel.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {hotel.description && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ color: "#000000", fontWeight: "bold", mb: 1 }}>
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#000000", lineHeight: 1.6 }}>
                      {hotel.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Room Types */}
            <Paper sx={{ p: 3, border: "2px solid #000000", borderRadius: 2, mb: 4 }}>
              <Typography variant="h5" sx={{ color: "#000000", fontWeight: "bold", mb: 3 }}>
                Room Types & Availability
              </Typography>
              
              <Grid container spacing={2}>
                {rooms.map((room, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card sx={{ border: "1px solid #000000", borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: "#000000", fontWeight: "bold" }}>
                          {room.type}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#000000", mb: 1 }}>
                          Total Rooms: {room.count}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#000000", mb: 1 }}>
                          Available: {room.available}
                        </Typography>
                        <Typography variant="h6" sx={{ color: "#000000", fontWeight: "bold" }}>
                          ${room.price}/night
                        </Typography>
                        <Chip 
                          label={room.available > 0 ? "Available" : "Fully Booked"} 
                          sx={{ 
                            backgroundColor: room.available > 0 ? "#ffffff" : "#000000",
                            color: room.available > 0 ? "#000000" : "#ffffff",
                            border: "1px solid #000000",
                            mt: 1
                          }} 
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Customer Reviews */}
            <Paper sx={{ p: 3, border: "2px solid #000000", borderRadius: 2 }}>
              <Typography variant="h5" sx={{ color: "#000000", fontWeight: "bold", mb: 3 }}>
                Customer Reviews
              </Typography>
              
              {reviews.map((review, index) => (
                <Box key={index} sx={{ mb: 3, pb: 2, borderBottom: index < reviews.length - 1 ? "1px solid #ddd" : "none" }}>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Avatar sx={{ backgroundColor: "#000000", color: "#ffffff" }}>
                      {review.guest.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: "#000000", fontWeight: "bold" }}>
                        {review.guest}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Rating value={review.rating} readOnly size="small" sx={{ color: "#000000" }} />
                        <Typography variant="body2" sx={{ color: "#000000" }}>
                          {review.date}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ color: "#000000", ml: 7 }}>
                    "{review.comment}"
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Quick Stats */}
            <Paper sx={{ p: 3, border: "2px solid #000000", borderRadius: 2, mb: 4 }}>
              <Typography variant="h5" sx={{ color: "#000000", fontWeight: "bold", mb: 3 }}>
                Quick Stats
              </Typography>
              
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body1" sx={{ color: "#000000" }}>
                  Total Rooms:
                </Typography>
                <Typography variant="body1" sx={{ color: "#000000", fontWeight: "bold" }}>
                  {rooms.reduce((sum, room) => sum + room.count, 0)}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body1" sx={{ color: "#000000" }}>
                  Available Rooms:
                </Typography>
                <Typography variant="body1" sx={{ color: "#000000", fontWeight: "bold" }}>
                  {rooms.reduce((sum, room) => sum + room.available, 0)}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body1" sx={{ color: "#000000" }}>
                  Average Rating:
                </Typography>
                <Typography variant="body1" sx={{ color: "#000000", fontWeight: "bold" }}>
                  {calculateAverageRating()}/5
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1" sx={{ color: "#000000" }}>
                  Total Reviews:
                </Typography>
                <Typography variant="body1" sx={{ color: "#000000", fontWeight: "bold" }}>
                  {reviews.length}
                </Typography>
              </Box>
            </Paper>

            {/* Amenities */}
            <Paper sx={{ p: 3, border: "2px solid #000000", borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" sx={{ color: "#000000", fontWeight: "bold" }}>
                  Hotel Amenities
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddAmenityDialog}
                    sx={{ color: "#000000", borderColor: "#000000" }}
                  >
                    Add Existing
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setAmenityDialogOpen(true)}
                    sx={{ color: "#000000", borderColor: "#000000" }}
                  >
                    Create New
                  </Button>
                </Box>
              </Box>
              
              {amenitiesLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={30} sx={{ color: "#000000" }} />
                </Box>
              ) : (
                <List dense>
                  {hotelAmenities.map((amenity, index) => (
                    <ListItem 
                      key={amenity.id || index} 
                      sx={{ px: 0 }}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => handleRemoveAmenityFromHotel(amenity.id)}
                          sx={{ color: "#dc3545" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemIcon sx={{ color: "#000000", minWidth: 40 }}>
                        {amenity.icon && iconMap[amenity.icon] ? iconMap[amenity.icon] : <SettingsIcon />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={amenity.name}
                        sx={{ color: "#000000" }}
                      />
                    </ListItem>
                  ))}
                  {hotelAmenities.length === 0 && (
                    <Typography variant="body2" sx={{ color: "#999999", textAlign: "center", p: 2 }}>
                      No amenities assigned to this hotel. Click "Add Existing" or "Create New" to add amenities.
                    </Typography>
                  )}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Create New Amenity Dialog */}
      <Dialog 
        open={amenityDialogOpen} 
        onClose={() => setAmenityDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: "1px solid #ddd" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ color: "#000000", fontWeight: "bold" }}>
              Create New Amenity
            </Typography>
            <IconButton onClick={() => setAmenityDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amenity Name"
                value={newAmenity.name}
                onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Icon</InputLabel>
                <Select
                  value={newAmenity.icon}
                  label="Icon"
                  onChange={(e) => setNewAmenity({ ...newAmenity, icon: e.target.value })}
                >
                  {iconOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {option.icon}
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newAmenity.available}
                    onChange={(e) => setNewAmenity({ ...newAmenity, available: e.target.checked })}
                  />
                }
                label="Available"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #ddd" }}>
          <Button 
            onClick={() => setAmenityDialogOpen(false)}
            sx={{ color: "#666666" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateAmenity}
            variant="contained"
            sx={{ backgroundColor: "#000000", color: "#ffffff" }}
          >
            Create Amenity
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Existing Amenity Dialog */}
      <Dialog 
        open={addAmenityDialogOpen} 
        onClose={() => setAddAmenityDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: "1px solid #ddd" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ color: "#000000", fontWeight: "bold" }}>
              Add Amenity to Hotel
            </Typography>
            <IconButton onClick={() => setAddAmenityDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Select Amenity</InputLabel>
            <Select
              value={selectedAmenityToAdd}
              label="Select Amenity"
              onChange={(e) => setSelectedAmenityToAdd(e.target.value)}
            >
              {availableAmenities.map((amenity) => (
                <MenuItem key={amenity.id} value={amenity.id}>
                  {amenity.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {availableAmenities.length === 0 && (
            <Typography variant="body2" sx={{ color: "#999999", mt: 2 }}>
              All amenities are already assigned to this hotel or no amenities exist.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #ddd" }}>
          <Button 
            onClick={() => setAddAmenityDialogOpen(false)}
            sx={{ color: "#666666" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddAmenityToHotel}
            variant="contained"
            disabled={!selectedAmenityToAdd}
            sx={{ backgroundColor: "#000000", color: "#ffffff" }}
          >
            Add to Hotel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HotelDetailPage;