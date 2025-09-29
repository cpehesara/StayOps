// src/pages/RoomView.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

import {
  getAllRooms,
  getRoomById,
  deleteRoom,
  getAvailableRooms,
  getRoomByType,
} from "../api/room";

import { PriorityHigh } from "@mui/icons-material";

const RoomView = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
  };

  const fetchRoomDetails = async (roomId) => {
    try {
      const data = await getRoomById(roomId);
      setSelectedRoom(data);
      setDrawerOpen(true);
    } catch (error) {
      console.error("Error fetching room details:", error);
    }
  };

  // Fetch rooms based on filter
  const fetchRooms = async () => {
    try {
      let data = [];
      if (filter === "available") {
        data = await getAvailableRooms();
      } else if (typeFilter !== "all") {
        data = await getRoomByType(typeFilter);
      } else {
        data = await getAllRooms();
      }

      // Combine both filters if applied
      if (filter === "available" && typeFilter !== "all") {
        data = data.filter(
          (room) => room.type.toLowerCase() === typeFilter.toLowerCase()
        );
      }

      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await deleteRoom(roomId);
        fetchRooms(); // Refresh list
      } catch (error) {
        console.error("Error deleting room:", error);
      }
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [filter, typeFilter]);

  // Determine border color based on room availability - FIXED
  const getBorderColor = (status) => {
    // Add proper null/undefined check
    const normalizedStatus = status?.toLowerCase() || 'unknown';
    switch (normalizedStatus) {
      case "available":
        return "#4caf50"; // green
      case "occupied":
        return "#f44336"; // red
      case "reserved":
        return "#ff9800"; // orange
      case "maintenance":
        return "#9c27b0"; // purple
      default:
        return "#9e9e9e"; // gray
    }
  };

  // Check if a room needs priority attention - FIXED
  const needsPriorityAttention = (room) => {
    // Add null check for availabilityStatus
    const status = room.availabilityStatus?.toLowerCase() || 'unknown';
    return status === "reserved" || status === "maintenance";
  };

  return (
    <Box p={3} sx={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <Typography variant="h4" mb={3} sx={{ fontWeight: "bold", color: "#000" }}>
        Room View
      </Typography>

      {/* Filter controls */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Availability</InputLabel>
          <Select
            value={filter}
            onChange={handleFilterChange}
            label="Filter by Availability"
          >
            <MenuItem value="all">All Rooms</MenuItem>
            <MenuItem value="available">Available Only</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={typeFilter}
            onChange={handleTypeFilterChange}
            label="Filter by Type"
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="Standard">Standard</MenuItem>
            <MenuItem value="Deluxe">Deluxe</MenuItem>
            <MenuItem value="Suite">Suite</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room.id}>
            <Card
              sx={{
                border: `3px solid ${getBorderColor(room.availabilityStatus)}`,
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                p: 1,
              }}
            >
              <CardContent sx={{ color: "#000" }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", mb: 1, color: "#000" }}
                >
                  Room {room.roomNumber}
                  {needsPriorityAttention(room) && (
                    <PriorityHigh 
                      sx={{ 
                        fontSize: '18px', 
                        color: '#f57c00', 
                        ml: 1,
                        verticalAlign: 'middle'
                      }} 
                    />
                  )}
                </Typography>
                <Typography>Floor: {room.floorNumber}</Typography>
                <Typography>Type: {room.type}</Typography>
                <Typography>Capacity: {room.capacity}</Typography>
                <Typography>Price/Night: {room.pricePerNight}</Typography>
                {/* Add safe display for status */}
                <Typography>Status: {room.availabilityStatus || 'Unknown'}</Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  sx={{ color: "#000", fontWeight: "bold" }}
                  onClick={() => fetchRoomDetails(room.id)}
                >
                  View
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteRoom(room.id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Drawer for Room Details */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box p={3} width={350} sx={{ backgroundColor: "#fff", color: "#000" }}>
          {selectedRoom ? (
            <>
              <Typography
                variant="h5"
                mb={2}
                sx={{ fontWeight: "bold", color: "#000" }}
              >
                Room {selectedRoom.roomNumber} Details
                {needsPriorityAttention(selectedRoom) && (
                  <PriorityHigh 
                    sx={{ 
                      fontSize: '20px', 
                      color: '#f57c00', 
                      ml: 1,
                      verticalAlign: 'middle'
                    }} 
                  />
                )}
              </Typography>
              <Typography>
                <strong>Floor:</strong> {selectedRoom.floorNumber}
              </Typography>
              <Typography>
                <strong>Type:</strong> {selectedRoom.type}
              </Typography>
              <Typography>
                <strong>Capacity:</strong> {selectedRoom.capacity}
              </Typography>
              <Typography>
                <strong>Price per Night:</strong> {selectedRoom.pricePerNight}
              </Typography>
              {/* Add safe display for status in drawer */}
              <Typography>
                <strong>Status:</strong> {selectedRoom.availabilityStatus || 'Unknown'}
              </Typography>
              <Typography>
                <strong>Description:</strong>{" "}
                {selectedRoom.description || "N/A"}
              </Typography>
              {needsPriorityAttention(selectedRoom) && (
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 2, 
                    backgroundColor: '#fff3e0', 
                    border: '1px solid #ff9800', 
                    borderRadius: '4px'
                  }}
                >
                  <Typography sx={{ color: '#f57c00', fontWeight: 'bold', fontSize: '14px' }}>
                    ⚠️ Priority Attention Required
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#666' }}>
                    This room requires immediate attention
                  </Typography>
                </Box>
              )}
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  backgroundColor: "#000",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#333" },
                }}
                onClick={() => setDrawerOpen(false)}
              >
                Close
              </Button>
            </>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default RoomView;