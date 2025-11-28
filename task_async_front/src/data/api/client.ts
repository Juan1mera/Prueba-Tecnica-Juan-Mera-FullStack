import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.55:3000/api/tasks',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    console.log('RESPONSE SUCCESS:', response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;