import { useState, useEffect } from 'react'
import { useAuth } from '../state/AuthContext'
import api from '../utils/api'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { user, loading, setUser } = useAuth()
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    company_name: ''
  })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '', 
        company_name: user.company_name || ''
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    
    try {
      const payload = {
        full_name: formData.full_name,
        phone: formData.phone,
        company_name: formData.company_name
      }

      console.log('🔄 Envoi PATCH avec payload:', payload)
      
      const { data } = await api.patch('/profile/', payload)
      console.log('✅ Réponse backend:', data)
      
      setMessage('✅ Profil mis à jour avec succès !')
      
      setUser(prevUser => ({
        ...prevUser,
        full_name: data.full_name,
        phone: data.phone,
        company_name: data.company_name
      }))

      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        company_name: data.company_name || ''
      })

      console.log('🎉 Profil mis à jour avec succès:', data)

    } catch (error) {
      console.error('💥 Erreur complète:', error)
      console.error('📋 Réponse erreur:', error.response?.data)
      
      setMessage('❌ Erreur: ' + (
        error.response?.data?.detail || 
        error.response?.data?.message || 
        'Veuillez réessayer'
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="ml-4 text-gray-600">Chargement du profil...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-medium p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
          <p className="text-gray-600 mb-8">Gérez vos informations personnelles</p>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className="flex items-center">
                {message.includes('✅') ? (
                  <span className="text-lg mr-2">✅</span>
                ) : (
                  <span className="text-lg mr-2">❌</span>
                )}
                <span>{message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Votre nom complet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="+253 XX XX XX XX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Nom de votre entreprise"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-1">
                L'email ne peut pas être modifié
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Mise à jour en cours...
                </span>
              ) : (
                '💾 Enregistrer les modifications'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité du compte</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-blue-600 text-lg">🔒</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">
                    Sécurité du mot de passe
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Pour modifier votre mot de passe, veuillez vous rendre dans les paramètres de sécurité.
                  </p>
                  <Link
                    to="/settings"
                    className="inline-block mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Paramètres de sécurité
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations complémentaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Rôle :</span>
                <span className="ml-2 font-medium capitalize">{user?.role || 'user'}</span>
              </div>
              <div>
                <span className="text-gray-500">Statut :</span>
                <span className="ml-2 font-medium">
                  {user?.is_premium ? 'Premium 🎯' : 'Standard'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Membre depuis :</span>
                <span className="ml-2 font-medium">
                  {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('fr-FR') : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Dernière connexion :</span>
                <span className="ml-2 font-medium">
                  {user?.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Aujourd\'hui'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}