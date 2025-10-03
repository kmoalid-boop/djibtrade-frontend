// src/utils/imageUtils.js
import { config } from '../config/environment'

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  
  // Supprimer le /api pour les médias
  const baseUrl = config.API_BASE_URL.replace('/api', '');
  return `${baseUrl}${imagePath}`;
};