import React, { useEffect, useState } from "react";
import {
  getAllRooms,
  getRoomById,
  deleteRoom,
  getAvailableRooms,
  getRoomsByType,
} from "../api/room";

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

  const fetchRooms = async () => {
    try {
      let data = [];
      if (filter === "available") {
        data = await getAvailableRooms();
      } else if (typeFilter !== "all") {
        data = await getRoomsByType(typeFilter);
      } else {
        data = await getAllRooms();
      }

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
        fetchRooms();
      } catch (error) {
        console.error("Error deleting room:", error);
      }
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [filter, typeFilter]);

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase() || 'unknown';
    switch (normalizedStatus) {
      case "available":
        return "border-black";
      case "occupied":
        return "border-gray-900";
      case "reserved":
        return "border-gray-600";
      case "maintenance":
        return "border-gray-400";
      default:
        return "border-gray-300";
    }
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase() || 'unknown';
    switch (normalizedStatus) {
      case "available":
        return "bg-black text-white";
      case "occupied":
        return "bg-gray-900 text-white";
      case "reserved":
        return "bg-gray-600 text-white";
      case "maintenance":
        return "bg-gray-400 text-black";
      default:
        return "border border-gray-300 text-black";
    }
  };

  const needsPriorityAttention = (room) => {
    const status = room.availabilityStatus?.toLowerCase() || 'unknown';
    return status === "reserved" || status === "maintenance";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-light tracking-tight text-black mb-3">
            Rooms
          </h1>
          <p className="text-gray-500 text-sm">
            Manage room availability and details
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-12">
          <select
            value={filter}
            onChange={handleFilterChange}
            className="px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
          >
            <option value="all">All Rooms</option>
            <option value="available">Available Only</option>
          </select>

          <select
            value={typeFilter}
            onChange={handleTypeFilterChange}
            className="px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors bg-white"
          >
            <option value="all">All Types</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
          </select>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`border-2 ${getStatusColor(room.availabilityStatus)} hover:border-black transition-colors`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-light tracking-tight mb-1">
                      Room {room.roomNumber}
                      {needsPriorityAttention(room) && (
                        <span className="ml-2 text-gray-600">⚠</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">Floor {room.floorNumber}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs ${getStatusBadge(room.availabilityStatus)}`}>
                    {room.availabilityStatus || 'Unknown'}
                  </span>
                </div>

                <div className="space-y-2 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="text-black">{room.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Capacity</span>
                    <span className="text-black">{room.capacity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price/Night</span>
                    <span className="text-black">${room.pricePerNight}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => fetchRoomDetails(room.id)}
                    className="flex-1 px-4 py-2 bg-black text-white text-xs hover:bg-gray-900 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="px-4 py-2 border border-gray-200 text-black text-xs hover:border-black transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-gray-400 text-sm">No rooms found</p>
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-20 z-40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 z-50 overflow-y-auto">
            <div className="p-8">
              {selectedRoom ? (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-light tracking-tight mb-2">
                      Room {selectedRoom.roomNumber}
                      {needsPriorityAttention(selectedRoom) && (
                        <span className="ml-2 text-gray-600">⚠</span>
                      )}
                    </h2>
                    <span className={`inline-block px-3 py-1 text-xs ${getStatusBadge(selectedRoom.availabilityStatus)}`}>
                      {selectedRoom.availabilityStatus || 'Unknown'}
                    </span>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="pb-4 border-b border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Floor</div>
                      <div className="text-black">{selectedRoom.floorNumber}</div>
                    </div>
                    <div className="pb-4 border-b border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Type</div>
                      <div className="text-black">{selectedRoom.type}</div>
                    </div>
                    <div className="pb-4 border-b border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Capacity</div>
                      <div className="text-black">{selectedRoom.capacity}</div>
                    </div>
                    <div className="pb-4 border-b border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Price per Night</div>
                      <div className="text-black">${selectedRoom.pricePerNight}</div>
                    </div>
                    {selectedRoom.description && (
                      <div className="pb-4 border-b border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Description</div>
                        <div className="text-black text-sm">{selectedRoom.description}</div>
                      </div>
                    )}
                  </div>

                  {needsPriorityAttention(selectedRoom) && (
                    <div className="mb-8 p-4 border border-gray-300">
                      <div className="text-sm font-medium text-black mb-1">
                        ⚠ Priority Attention Required
                      </div>
                      <div className="text-xs text-gray-500">
                        This room requires immediate attention
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="w-full px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors"
                  >
                    Close
                  </button>
                </>
              ) : (
                <p className="text-gray-400">Loading...</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoomView;