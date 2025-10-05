// src/utils/imageUtils.js - CORRIGÉ

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // DEBUG: Afficher l'URL reçue
  console.log('🖼️ URL image reçue:', imagePath);
  
  // Si c'est déjà une URL complète (Cloudinary), la retourner telle quelle
  if (imagePath.startsWith('http')) {
    console.log('✅ URL Cloudinary détectée, retour direct');
    return imagePath;
  }
  
  // Si c'est un chemin local (ancien système)
  console.log('🔄 Construction URL locale');
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  return `${baseUrl}${imagePath}`;
};