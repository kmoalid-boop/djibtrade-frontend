// src/utils/imageUtils.js
// Version ULTRA SIMPLE pour Cloudinary

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // DEBUG: Afficher l'URL reçue (optionnel - pour le débogage)
  console.log('🖼️ URL image reçue:', imagePath);
  
  // Retourne directement l'URL - Cloudinary ou locale
  return imagePath;
};