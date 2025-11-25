import axios from "axios";

const BASE_URL = "https://nonprotuberant-nonprojective-son.ngrok-free.dev/api/hotels";

// Standard headers without authentication
const getHeaders = () => ({
  "Content-Type": "application/json",
});

export const fetchHotels = async () => {
  const response = await axios.get(`${BASE_URL}/getAll`);
  return response.data;
};

export const addHotel = async (hotel) => {
  const response = await axios.post(`${BASE_URL}/create`, hotel, {
    headers: getHeaders(),
  });
  return response.data;
};

export const deleteHotel = async (id) => {
  await axios.delete(`${BASE_URL}/delete/${id}`);
};

export const updateHotel = async (id, hotel) => {
  const response = await axios.put(`${BASE_URL}/update/${id}`, hotel, {
    headers: getHeaders(),
  });
  return response.data;
};

export const getHotelById = async (id) => {
  const response = await axios.get(`${BASE_URL}/get/${id}`);
  return response.data;
};
