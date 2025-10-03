import axios from 'axios'
import { config } from '../config/environment'

// Debug: Affiche l'URL API utilisée et l'environnement
console.log('🔄 Chargement de la configuration API...')
console.log('📦 Environnement:', import.meta.env.MODE)
console.log('🔗 URL API from env:', import.meta.env.VITE_API_BASE_URL)
console.log('🌐 URL API utilisée:', config.API_BASE_URL)

const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 15000,
})

// Debug: Confirmation de la configuration
console.log('✅ Configuration API initialisée:', {
  baseURL: api.defaults.baseURL,
  timeout: api.defaults.timeout
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔐 Token ajouté à la requête')
    } else {
      console.log('⚠️ Aucun token trouvé pour la requête')
    }
    return config
  },
  (error) => {
    console.error('❌ Erreur intercepteur requête:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse API reçue:', {
      status: response.status,
      url: response.config.url
    })
    return response
  },
  async (error) => {
    console.error('❌ Erreur API:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    })
    
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Tentative de rafraîchissement du token...')
      originalRequest._retry = true
      try {
        const refresh = localStorage.getItem('refresh')
        if (refresh) {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/token/refresh/`,
            { refresh }
          )
          localStorage.setItem('access', data.access)
          api.defaults.headers.Authorization = `Bearer ${data.access}`
          originalRequest.headers.Authorization = `Bearer ${data.access}`
          console.log('✅ Token rafraîchi avec succès')
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('❌ Erreur refresh token:', refreshError)
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        if (window.location.pathname !== '/login') {
          console.log('🔒 Redirection vers la page de login')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const handleApiError = (error) => {
  console.error('📋 Gestion d\'erreur API:', error)
  
  if (error.response) {
    return {
      message: error.response.data?.detail || 
               error.response.data?.message || 
               'Erreur serveur',
      status: error.response.status,
      data: error.response.data
    }
  } else if (error.request) {
    return {
      message: 'Pas de réponse du serveur. Vérifiez votre connexion.',
      status: null
    }
  } else {
    return {
      message: error.message || 'Erreur inconnue',
      status: null
    }
  }
}

export default api