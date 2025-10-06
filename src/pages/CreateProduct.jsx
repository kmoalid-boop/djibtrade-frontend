import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../state/AuthContext'
import { FiArrowLeft, FiUpload, FiX, FiDollarSign, FiPackage, FiMapPin, FiMessageCircle, FiPhone } from 'react-icons/fi'

export default function CreateProduct() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [imagePreview, setImagePreview] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    unit_price: '',
    currency: 'DJF',
    stock: '1',
    category: '',
    city: '',
    contact_method: 'whatsapp',
    whatsapp_contact: '',
    phone_contact: '',
    image: null
  })

// Récupération des catégories
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/annonces/categories/')
      // TOUJOURS utiliser data.results - API Django REST paginée
      setCategories(data.results || [])
    } catch (error) {
      console.error('Erreur chargement catégories:', error)
      setCategories([])
    }
  }
  
  fetchCategories()
}, [])

  // Gestion des changements de formulaire
  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target
    if (name === 'image') {
      setFormData(prev => ({ ...prev, image: files[0] }))
      // Créer la preview
      if (files[0]) {
        const reader = new FileReader()
        reader.onload = () => {
          setImagePreview(reader.result)
        }
        reader.readAsDataURL(files[0])
      } else {
        setImagePreview(null)
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }, [])

  // Supprimer l'image
  const removeImage = useCallback(() => {
    setFormData(prev => ({ ...prev, image: null }))
    setImagePreview(null)
  }, [])

  // Validation du formulaire
  const isFormValid = useMemo(() => {
    return formData.title.trim() && 
           formData.description.trim() && 
           formData.unit_price && 
           parseInt(formData.unit_price) > 0
           formData.stock && 
           parseInt(formData.stock) > 0 &&
           formData.image
  }, [formData])

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!isFormValid) {
      setError("Veuillez remplir tous les champs obligatoires correctement.")
      setLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      
      Object.keys(formData).forEach(key => {
        const value = formData[key]
        if (value === null || value === undefined) return
        
        // Ne pas envoyer les champs vides sauf les contacts optionnels
        if (typeof value === 'string' && value.trim() === '' && 
            !['whatsapp_contact', 'phone_contact'].includes(key)) return
        
        formDataToSend.append(key, value)
      })

      await api.post('/annonces/products/', formDataToSend)

      navigate('/dashboard', { 
        state: { 
          message: '🎉 Annonce publiée avec succès !',
          type: 'success'
        } 
      })
    } catch (err) {
      console.error('Erreur publication:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.detail || 
                          err.response?.data?.image?.[0] ||
                          'Erreur lors de la publication. Vérifiez vos données.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* En-tête amélioré */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-all duration-200 hover:translate-x-[-2px] group"
          >
            <FiArrowLeft className="mr-2 group-hover:translate-x-[-2px] transition-transform" />
            Retour
          </button>
          
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
              Publier une annonce
            </h1>
            <p className="text-gray-600 mt-2">
              Partagez votre produit avec la communauté Djibtrade
            </p>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-soft border border-gray-100">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-start">
              <div className="flex-1">
                <strong className="font-semibold">Erreur :</strong> {error}
              </div>
              <button 
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700 ml-4"
              >
                <FiX size={18} />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section informations de base */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Informations du produit
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Titre de l'annonce *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                  placeholder="Ex: Farine de blé premium 1kg"
                />
                <div className="text-xs text-gray-500 mt-2 text-right">
                  {formData.title.length}/100 caractères
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 resize-none"
                  placeholder="Décrivez votre produit en détail (caractéristiques, état, avantages...)"
                />
                <div className="text-xs text-gray-500 mt-2 text-right">
                  {formData.description.length}/500 caractères
                </div>
              </div>
            </div>

            {/* Section prix et stock */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Prix et stock
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <FiDollarSign className="inline mr-2 text-green-500" />
                    Prix unitaire *
                  </label>
                  <input
                    type="number"
                    name="unit_price"
                    value={formData.unit_price}
                    onChange={handleChange}
                    required
                    min="1"
                    step="1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Devise *
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                  >
                    <option value="DJF">Franc Djiboutien (DJF)</option>
                    <option value="USD">Dollar US (USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <FiPackage className="inline mr-2 text-blue-500" />
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Catégorie
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section localisation */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Localisation
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <FiMapPin className="inline mr-2 text-purple-500" />
                  Ville
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                  placeholder="Ex: Djibouti, Ali Sabieh, Arta..."
                />
              </div>
            </div>

            {/* Section contact */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                Contact
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Méthode de contact *
                </label>
                <select
                  name="contact_method"
                  value={formData.contact_method}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                >
                  <option value="whatsapp">WhatsApp uniquement</option>
                  <option value="phone">Téléphone uniquement</option>
                  <option value="both">WhatsApp et Téléphone</option>
                </select>
              </div>

              {formData.contact_method !== 'phone' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <FiMessageCircle className="inline mr-2 text-green-500" />
                    Numéro WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="whatsapp_contact"
                    value={formData.whatsapp_contact}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                    placeholder="+253 XX XX XX XX"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    📱 Laissez vide pour utiliser votre numéro ({user?.phone || 'non renseigné'})
                  </p>
                </div>
              )}

              {formData.contact_method !== 'whatsapp' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <FiPhone className="inline mr-2 text-blue-500" />
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone_contact"
                    value={formData.phone_contact}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                    placeholder="+253 XX XX XX XX"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    🏢 Numéro professionnel pour les entreprises
                  </p>
                </div>
              )}
            </div>

            {/* Section image */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                Image du produit
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Photo du produit *
                </label>
                
                {!imagePreview ? (
                  <label className="flex flex-col items-center justify-center px-8 py-12 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group">
                    <FiUpload className="w-12 h-12 mb-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-lg font-medium mb-2">Choisir une image</span>
                    <span className="text-sm text-gray-500 text-center">
                      Formats: JPG, PNG, GIF, WEBP<br />
                      Taille max: 5MB
                    </span>
                    <input
                      type="file"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                      className="hidden"
                      required
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full max-w-md h-64 object-cover rounded-2xl border-2 border-gray-200 shadow-md" 
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
                
                {!formData.image && (
                  <p className="text-sm text-red-500 mt-3 flex items-center">
                    ⚠️ L'image est obligatoire pour publier une annonce
                  </p>
                )}
              </div>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 group"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Publication en cours...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FiUpload className="mr-3 group-hover:scale-110 transition-transform" />
                  Publier l'annonce
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}