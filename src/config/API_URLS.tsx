import { API_BASE_URL } from '@env';
console.log('Base URL', API_BASE_URL);

const API_URLS = {
  BASE_URL: API_BASE_URL || 'https://api.pukra.in',

  // Public
  DOCTORS: '/doctors',
  EVENTS: '/events',
  NEWS: '/news',
  SLIDES: '/slides',
  BLOG: '/blogs',

  // Patient Authentication
  PATIENT_REGISTER: '/api/register',
  PATIENT_LOGIN: '/api/login',
  PATIENT_FORGOT_PASSWORD: 'api/forgot-password',
  PATIENT_LOGOUT: '/api/patient/logout',
  PATIENT_PROFILE: '/api/patient/profile',
  PATIENT_CHANGE_PASSWORD: '/api/patient/change-password',
  APPOINTMENTS: '/api/patient/appointment',
  MY_APPOINTMENTS: '/api/patient/myappointments',
};

export default API_URLS;
