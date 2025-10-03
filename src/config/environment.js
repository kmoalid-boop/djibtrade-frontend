// src/config/environment.js
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  IS_DEV: import.meta.env.DEV,
};

// Debug sécurisé
console.log('🔄 Configuration chargée:', {
  API_BASE_URL: config.API_BASE_URL,
  IS_DEV: config.IS_DEV
});