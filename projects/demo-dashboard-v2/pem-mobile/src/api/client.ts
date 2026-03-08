import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Change to your backend URL

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
