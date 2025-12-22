import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URLS from '../config/API_URLS';
import { Alert } from 'react-native';

const Api = axios.create({
  baseURL: API_URLS.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ✅ Attach Patient Token
Api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('patientToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

// Server / Network Error Handler
Api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      console.error('Network/Server error:', error);
      Alert.alert('Network/Server error', 'Please try again later.');
    }

    return Promise.reject(error);
  },
);

export default Api;
