import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { 
  FiArrowLeft, 
  FiMapPin, 
  FiEye, 
  FiCalendar, 
  FiUser, 
  FiPhone, 
  FiMessageSquare, 
  FiImage, 
  FiShare2, 
  FiHeart,
  FiPackage,
  FiDollarSign
} from 'react-icons/fi'
import { getImageUrl } from '../utils/imageUtils'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageLoading, setImageLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  // Mémoïsation des fonctions de formatage
  const formatPrice = useCallback((price, currency) => {
    if (!price && price !== 0) return 'Prix non spécifié'
    
    if (currency === 'DJF') {
      return new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 0
      }).format(price) + ' DJF'
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }, [])

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Date non spécifiée'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  // Calcul du prix total mémoïsé
  const totalPrice = useMemo(() => {
    if (!product || !product.unit_price || !product.stock) return null
    return product.unit_price * product.stock
  }, [product])

  // Fonction pour partager l'annonce
  const handleShare = useCallback(async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Erreur partage:', err)
      }
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href)
      alert('Lien copié dans le presse-papier !')
    }
  }, [product])

  // Sauvegarder l'annonce
  const handleSave = useCallback(() => {
    setIsSaved(prev => !prev)
    // Ici vous pourriez appeler une API pour sauvegarder
  }, [])

  // Récupération des détails du produit
  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get(`/annonces/products/${id}/`)
      setProduct(data)
    } catch (err) {
      console.error('Erreur détail produit:', err)
      setError(err.response?.status === 404 
        ? 'Annonce non trouvée' 
        : 'Erreur de chargement des détails du produit'
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProductDetails()
  }, [fetchProductDetails])

  // Composant de loading amélioré
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-blue-700 font-medium text-lg">Chargement de l'annonce...</p>
          <p className="text-gray-500 text-sm mt-2">Veuillez patienter</p>
        </div>
      </div>
    )
  }

  // Composant d'erreur amélioré
  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-soft border border-gray-100">
          <div className="text-8xl mb-6">😢</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Annonce non trouvée</h2>
          <p className="text-gray-600 mb-6">
            {error || "Cette annonce n'existe pas ou a été supprimée."}
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              Retour
            </button>
            <button 
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Voir les annonces
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Bouton retour amélioré */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-all duration-200 hover:translate-x-[-2px] group"
        >
          <FiArrowLeft className="mr-2 group-hover:translate-x-[-2px] transition-transform" />
          Retour aux annonces
        </button>

        <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100">
          <div className="grid lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Section image améliorée */}
            <div className="space-y-4">
              <div className="sticky top-6">
                <div className="relative bg-gray-50 rounded-2xl overflow-hidden">
                  {product.image ? (
                    <>
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      <img 
                        src={getImageUrl(product.image)} 
                        alt={product.title}
                        className={`w-full h-96 object-cover transition-all duration-500 ${
                          imageLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                        }`}
                        onLoad={() => setImageLoading(false)}
                        onError={() => setImageLoading(false)}
                      />
                    </>
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex flex-col items-center justify-center">
                      <FiImage className="text-6xl text-gray-400 mb-4" />
                      <p className="text-gray-500">Image non disponible</p>
                    </div>
                  )}
                </div>
                
                {/* Actions secondaires */}
                <div className="flex items-center justify-center mt-6 space-x-6">
                  <button 
                    onClick={handleSave}
                    className={`flex items-center transition-all duration-200 ${
                      isSaved ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                    }`}
                  >
                    <FiHeart className={`mr-2 ${isSaved ? 'fill-current' : ''}`} /> 
                    {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    <FiShare2 className="mr-2" /> Partager
                  </button>
                </div>
              </div>
            </div>

            {/* Section détails améliorée */}
            <div className="space-y-6">
              {/* En-tête */}
              <div>
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-full mb-4 shadow-sm">
                  {product.category_name || 'Général'}
                </span>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.title}
                </h1>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {product.description || 'Aucune description disponible.'}
                </p>
              </div>

              {/* Prix et stock */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {formatPrice(product.unit_price, product.currency)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">prix unitaire</div>
                  </div>
                  <FiDollarSign className="text-4xl text-blue-400 opacity-50" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Stock disponible:</span>
                    <span className="font-semibold flex items-center">
                      <FiPackage className="mr-2 text-blue-500" />
                      {product.stock || 0} unité{product.stock !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {product.stock > 1 && totalPrice && (
                    <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                      <span className="text-gray-600 font-medium">Prix total:</span>
                      <span className="text-xl font-bold text-gray-800">
                        {formatPrice(totalPrice, product.currency)}
                      </span>
                    </div>
                  )}

                  {product.stock === 1 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                      <div className="text-yellow-800 text-sm font-medium text-center">
                        ⚠ Dernière unité disponible !
                      </div>
                    </div>
                  )}

                  {(!product.stock || product.stock === 0) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                      <div className="text-red-800 text-sm font-medium text-center">
                        ❌ Rupture de stock
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <FiMapPin className="text-blue-500 mr-3 text-lg flex-shrink-0" />
                  <div>
                    <div className="text-gray-500 text-sm">Localisation</div>
                    <div className="font-semibold text-gray-900">{product.city || 'Non spécifié'}</div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <FiEye className="text-blue-500 mr-3 text-lg flex-shrink-0" />
                  <div>
                    <div className="text-gray-500 text-sm">Vues</div>
                    <div className="font-semibold text-gray-900">{product.views || 0}</div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <FiCalendar className="text-blue-500 mr-3 text-lg flex-shrink-0" />
                  <div>
                    <div className="text-gray-500 text-sm">Publié le</div>
                    <div className="font-semibold text-gray-900">{formatDate(product.created_at)}</div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <FiUser className="text-blue-500 mr-3 text-lg flex-shrink-0" />
                  <div>
                    <div className="text-gray-500 text-sm">Vendeur</div>
                    <div className="font-semibold text-gray-900">{product.owner_name || 'Anonyme'}</div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Contacter le vendeur
                </h3>
                
                <div className="space-y-3">
                  {product.whatsapp_link && (
                    <a
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center group"
                      href={product.whatsapp_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FiMessageSquare className="mr-3 text-lg group-hover:scale-110 transition-transform" />
                      Contacter sur WhatsApp
                    </a>
                  )}

                  {product.phone_contact && (
                    <a
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center group"
                      href={`tel:${product.phone_contact}`}
                    >
                      <FiPhone className="mr-3 text-lg group-hover:scale-110 transition-transform" />
                      Appeler {product.phone_contact}
                    </a>
                  )}

                  {!product.whatsapp_link && !product.phone_contact && (
                    <div className="text-center text-gray-500 py-6 bg-gray-50 rounded-xl border border-gray-200">
                      <FiUser className="text-4xl text-gray-400 mx-auto mb-3" />
                      <p className="font-medium">Aucune information de contact disponible</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}