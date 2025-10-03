import { useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ChangePassword() {
  const { changePassword, loading } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    // Validation
    if (formData.new_password !== formData.confirm_password) {
      setError('Les nouveaux mots de passe ne correspondent pas')
      return
    }

    if (formData.new_password.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }

    const res = await changePassword(formData.old_password, formData.new_password)
    
    if (res.ok) {
      setMessage(res.message)
      setFormData({ old_password: '', new_password: '', confirm_password: '' })
      setTimeout(() => {
        navigate('/profile')
      }, 2000)
    } else {
      setError(res.error.detail || res.error.old_password || 'Erreur lors du changement de mot de passe')
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-md mx-auto px-4">
        <button 
          onClick={() => navigate(-1)}
          className="text-primary-600 hover:text-primary-700 mb-6 flex items-center gap-2 transition-colors"
        >
          ← Retour
        </button>

        <div className="bg-white rounded-2xl shadow-medium p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Changer le mot de passe</h1>
          <p className="text-gray-600 mb-6">Mettez à jour votre mot de passe pour sécuriser votre compte</p>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <span className="text-lg mr-2">✅</span>
                <span>{message}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <span className="text-lg mr-2">❌</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel *
              </label>
              <input
                type="password"
                name="old_password"
                value={formData.old_password}
                onChange={handleChange}
                required
                className="input w-full border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                placeholder="Votre mot de passe actuel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe *
              </label>
              <input
                type="password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                required
                minLength={6}
                className="input w-full border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                placeholder="Au moins 6 caractères"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe *
              </label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                minLength={6}
                className="input w-full border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                placeholder="Confirmez votre nouveau mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Modification en cours...
                </span>
              ) : (
                '🔒 Modifier le mot de passe'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Conseils de sécurité</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Utilisez au moins 6 caractères</li>
              <li>• Combinez lettres, chiffres et caractères spéciaux</li>
              <li>• Évitez les mots de passe courants</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}