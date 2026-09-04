import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - server took too long to respond');
    }
    if (!error.response) {
      throw new Error('Cannot connect to backend. Make sure server is running on port 8000');
    }
    throw error;
  }
);

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend not reachable: ' + error.message);
  }
};

export const predictAnomaly = async (sensorData) => {
  try {
    const response = await api.post('/predict', { values: sensorData });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data?.detail || 'Unknown'}`);
    }
    throw error;
  }
};

export default api;