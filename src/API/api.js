import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Adjust as per your FastAPI configuration

export const loginUser = async (userData) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', userData.email);
    formData.append('password', userData.password);

    const response = await axios.post(`${API_BASE_URL}/token`, formData,{
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },});
    return response.data; // This will return the access token and other response data
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const formData = new FormData();
    formData.append('username', userData.email);
    formData.append('password', userData.password);

    const response = await axios.post(`${API_BASE_URL}/users`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }},)
  } catch (error) {
    if(error.status===400)
      console.log("user is found ")
  }
};
