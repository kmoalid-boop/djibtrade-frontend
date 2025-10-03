import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../state/AuthContext'
import { FiArrowLeft, FiUpload, FiX, FiDollarSign, FiPackage, FiMapPin, FiMessageCircle, FiPhone } from 'react-icons/fi'
import { getImageUrl } from '../utils/imageUtils'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [imagePreview, setImagePreview] = useState(null)
  const [productImage, setProductImage] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    unit_price: '',
    currency: 'DJF',
    stock: '',
    category: '',
    city: '',
    contact_method: 'whatsapp',
    whatsapp_contact: '',
    phone_contact: '',
    image: null
  })

  // Chargement des détails du produit
  const fetchProductDetails = useCallback(async () => {
    try {
      setLoadingProduct(true)
      setError('')
      const { data: product } = await api.get(`/annonces/products/${id}/`)
      
      // Vérifier que l'utilisateur est bien le propriétaire
      if (product.owner !== user?.id) {
        navigate('/dashboard', { 
          state: { 
            message: 'Vous ne pouvez pas modifier cette annonce',
            type: 'error'
          } 
        })
        return
      }
      
      setFormData({
        title: product.title || '',
        description: product.description || '',
        unit_price: product.unit_price || '',
        currency: product.currency || 'DJF',
        stock: product.stock || '',
        category: product.category || '',
        city: product.city || '',
        contact_method: product.contact_method || 'whatsapp',
        whatsapp_contact: product.whatsapp_contact || '',
        phone_contact: product.phone_contact || '',
        image: null
      })

      // Set image preview if exists
      if (product.image) {
        setImagePreview(getImageUrl(product.image))
        setProductImage(product.image)
      }
    } catch (err) {
      console.error('Erreur chargement produit:', err)
      setError(
        err.response?.status === 404 
          ? 'Annonce non trouvée' 
          : 'Impossible de charger les détails du produit'
      )
    } finally {
      setLoadingProduct(false)
    }
  }, [id, user?.id, navigate])

  // Chargement des catégories
  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get('/annonces/categories/')
      if (Array.isArray(data)) {
        setCategories(data)
      } else if (data.results && Array.isArray(data.results)) {
        setCategories(data.results)
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error)
      setCategories([])
    }
  }, [])

  useEffect(() => {
    fetchProductDetails()
    fetchCategories()
  }, [fetchProductDetails, fetchCategories])

  // Gestion des changements de formulaire
  const handleChange = useCallback((e) => {
    const { name, value, files, type } = e.target
    
    if (type === 'file' && name === 'image') {
      const file = files[0]
      setFormData(prev => ({ ...prev, image: file }))
      
      // Créer la preview
      if (file) {
        const reader = new FileReader()
        reader.onload = () => setImagePreview(reader.result)
        reader.readAsDataURL(file)
      } else {
        setImagePreview(null)
      }
    } else if (type === 'radio') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        // Réinitialiser les champs de contact quand on change la méthode
        ...(name === 'contact_method' && {
          whatsapp_contact: '',
          phone_contact: ''
        })
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }, [])

  // Supprimer l'image
  const removeImage = useCallback(() => {
    setFormData(prev => ({ ...prev, image: null }))
    setImagePreview(null)
    setProductImage(null)
  }, [])

  // Validation du formulaire
  const isFormValid = useMemo(() => {
    return formData.title.trim() && 
           formData.description.trim() && 
           formData.unit_price && 
           parseInt(formData.unit_price) >= 1 &&
           formData.stock !== '' && 
           parseInt(formData.stock) >= 0 &&
           formData.category &&
           formData.city.trim() &&
           (formData.contact_method === 'whatsapp' ? formData.whatsapp_contact.trim() : true) &&
           (formData.contact_method === 'phone' ? formData.phone_contact.trim() : true) &&
           (formData.image || productImage)
  }, [formData, productImage])

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
      
      // Ajouter seulement les champs modifiés
      Object.keys(formData).forEach(key => {
        const value = formData[key]
        if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(key, value)
        }
      })

      await api.patch(`/annonces/products/${id}/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      navigate('/dashboard', { 
        state: { 
          message: '✅ Annonce modifiée avec succès !',
          type: 'success'
        } 
      })
    } catch (err) {
      console.error('Erreur modification:', err)
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.detail || 
                          err.response?.data?.image?.[0] ||
                          'Erreur lors de la modification. Vérifiez vos données.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // États de chargement
  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-blue-700 font-medium text-lg">Chargement de l'annonce...</p>
          <p className="text-gray-500 text-sm mt-2">Veuillez patienter</p>
        </div>
      </div>
    )
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
            Retour au tableau de bord
          </button>
          
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
              Modifier l'annonce
            </h1>
            <p className="text-gray-600 mt-2">
              Mettez à jour les informations de votre produit
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
                  required
                  value={formData.title}
                  onChange={handleChange}
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
                  rows={5}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 resize-none"
                  placeholder="Décrivez votre produit en détail..."
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
                    min="1"
                    step="1"
                    required
                    value={formData.unit_price}
                    onChange={handleChange}
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
                    required
                    value={formData.currency}
                    onChange={handleChange}
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
                    min="0"
                    required
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    required
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
                  Ville *
                </label>
                <input
                  type="text"
                  name="city"
                  required
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
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Méthode de contact *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.contact_method === 'whatsapp' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="contact_method"
                      value="whatsapp"
                      checked={formData.contact_method === 'whatsapp'}
                      onChange={handleChange}
                      className="mr-3 text-green-500 focus:ring-green-500"
                    />
                    <div className="flex items-center">
                      <FiMessageCircle className="text-green-500 mr-2" />
                      <span>WhatsApp</span>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.contact_method === 'phone' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="contact_method"
                      value="phone"
                      checked={formData.contact_method === 'phone'}
                      onChange={handleChange}
                      className="mr-3 text-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex items-center">
                      <FiPhone className="text-blue-500 mr-2" />
                      <span>Téléphone</span>
                    </div>
                  </label>
                </div>
              </div>

              {formData.contact_method === 'whatsapp' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <FiMessageCircle className="inline mr-2 text-green-500" />
                    Numéro WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="whatsapp_contact"
                    required
                    value={formData.whatsapp_contact}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                    placeholder="+253 XX XX XX XX"
                  />
                </div>
              )}

              {formData.contact_method === 'phone' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <FiPhone className="inline mr-2 text-blue-500" />
                    Numéro de téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone_contact"
                    required
                    value={formData.phone_contact}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                    placeholder="+253 XX XX XX XX"
                  />
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
                
                <div className="space-y-4">
                  {/* Image actuelle */}
                  {productImage && !imagePreview && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">Image actuelle :</p>
                      <div className="relative inline-block">
                        <img 
                          src={getImageUrl(productImage)} 
                          alt="Current product" 
                          className="w-48 h-48 object-cover rounded-2xl border-2 border-gray-200 shadow-md" 
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Nouvelle image ou upload */}
                  {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center px-8 py-12 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group">
                      <FiUpload className="w-12 h-12 mb-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-lg font-medium mb-2">
                        {productImage ? 'Changer l\'image' : 'Choisir une image'}
                      </span>
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
                      />
                    </label>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">Nouvelle image :</p>
                      <div className="relative inline-block">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-48 h-48 object-cover rounded-2xl border-2 border-gray-200 shadow-md" 
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {!formData.image && !productImage && (
                  <p className="text-sm text-red-500 mt-3 flex items-center">
                    ⚠️ L'image est obligatoire
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
                  Modification en cours...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FiUpload className="mr-3 group-hover:scale-110 transition-transform" />
                  Modifier l'annonce
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}