import axios from 'axios';

export const getTrips = async () => {
    const res = await axios.get("http://localhost:8000/api/trips");
    return res.data;
}