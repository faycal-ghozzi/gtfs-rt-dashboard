import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const getTrips = async () => {
    const res = await axios.get(API_URL+"/api/trips");
    return res.data;
}

export const getHistory = async () => {
    const res = await axios.get(`${API_URL}/api/history`);
    return res.data;
  };