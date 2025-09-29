import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminHotelManagement = () => {
  const [hotels, setHotels] = useState([]); // Ensure it's initialized as an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/hotels');
        setHotels(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading hotels</div>;

  return (
    <div>
      <h1>Hotel Management</h1>
      {Array.isArray(hotels) && hotels.map((hotel) => (
        <div key={hotel.id}>
          <h2>{hotel.name}</h2>
          <p>{hotel.description}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminHotelManagement;