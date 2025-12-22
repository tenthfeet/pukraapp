import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URLS from '../config/API_URLS';

const PatientApi = axios.create({
  baseURL: API_URLS.BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

// Attach Token from AsyncStorage
PatientApi.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('patientToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

export default PatientApi;
