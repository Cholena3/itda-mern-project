// API Configuration
const isDevelopment = window.location.hostname === 'localhost';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (isDevelopment 
    ? 'http://localhost:5000'
    : 'https://itda-backend.onrender.com');

export const API_URL = `${API_BASE_URL}/api`;

export const SOCKET_URL = API_BASE_URL;

export default {
  API_BASE_URL,
  API_URL,
  SOCKET_URL
};