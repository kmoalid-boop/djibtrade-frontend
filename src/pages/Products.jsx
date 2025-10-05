import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { FiSearch, FiMapPin, FiPhone, FiMessageSquare, FiImage, FiFilter } from 'react-icons/fi'
import { getImageUrl } from '../utils/imageUtils'

export default function Products() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [category, setCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [nextPage, setNextPage] = useState(null)
  const [prevPage, setPrevPage] = useState(null)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Mémoisation de la fonction de formatage des prix
  const formatPrice = useCallback((price, currency) => {
    if (!price) return 'Prix non spécifié'
    
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

  // Récupération des catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/annonces/categories/')
        if (Array.isArray(data)) {
          setCategories(data)
        } else if (data.results && Array.isArray(data.results)) {
          setCategories(data.results)
        } else {
          setCategories([])
        }
      } catch (error) {
        console.error('Erreur categories:', error)
        setCategories([])
      }
    }
    
    fetchCategories()
  }, [])

  // Récupération des produits avec debounce intégré
  const fetchProducts = useCallback(async (url = null) => {
    setLoading(true)
    setError(null)
    
    try {
      let endpoint = url ?? '/annonces/products/'
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (searchQuery) params.set('search', searchQuery)

      if (!url && params.toString()) {
        endpoint += `?${params.toString()}`
      }

      const { data } = await api.get(endpoint)
      
      if (Array.isArray(data)) {
        setItems(data)
        setNextPage(null)
        setPrevPage(null)
        setCount(data.length)
      } else {
        setItems(data.results || [])
        setNextPage(data.next)
        setPrevPage(data.previous)
        setCount(data.count || 0)
      }
    } catch (error) {
      console.error('Erreur produits:', error)
      setError('Erreur de chargement des annonces. Veuillez réessayer.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [category, searchQuery])

  // Debounce pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts()
    }, 500) // 500ms de debounce

    return () => clearTimeout(timeoutId)
  }, [fetchProducts])

  const handleProductClick = useCallback((productId) => {
    navigate(`/products/${productId}`)
  }, [navigate])

  // Composant de carte de produit mémoïsé
  const ProductCard = useMemo(() => ({ product }) => (
    <div 
      className="bg-white rounded-xl shadow-soft cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:translate-y-[-4px] overflow-hidden group"
      onClick={() => handleProductClick(product.id)}
    >
      {/* Section image avec fallback amélioré */}
      <div className="relative h-64 overflow-hidden bg-gray-100">
        {product.image ? (
          <img 
            src={product.image_url || getImageUrl(product.image)} 
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FiImage className="text-4xl text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-full shadow-sm">
            {product.category_name || 'Général'}
          </span>
        </div>
      </div>
      
      {/* Contenu de la carte */}
      <div className="p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {product.description || 'Aucune description disponible'}
        </p>
        <div className="text-xl font-bold text-blue-600 mb-3">
          {formatPrice(product.unit_price, product.currency)}
        </div>
        
        {/* Informations supplémentaires */}
        <div className="space-y-2">
          {product.stock > 1 && (
            <div className="text-sm text-green-600 font-medium">
              {product.stock} unités disponibles
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <span className="flex items-center mr-4">
              {product.contact_method === 'whatsapp' && <FiMessageSquare className="mr-1" />}
              {product.contact_method === 'phone' && <FiPhone className="mr-1" />} 
              {product.contact_method === 'both' && (
                <>
                  <FiMessageSquare className="mr-1" />
                  <FiPhone className="mr-1" />
                </>
              )}
              <span className="text-xs">
                {product.contact_method === 'whatsapp' && 'WhatsApp'}
                {product.contact_method === 'phone' && 'Téléphone'}
                {product.contact_method === 'both' && 'WhatsApp + Tél'}
              </span>
            </span>
            
            <span className="flex items-center text-sm text-gray-500">
              <FiMapPin className="mr-1" size={14} />
              <span className="text-xs">{product.city || 'Non spécifié'}</span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Bouton de contact */}
      {product.whatsapp_link && (
        <div className="px-6 pb-6 pt-2">
          <a
            className="block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            href={product.whatsapp_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            📱 Contacter sur WhatsApp
          </a>
        </div>
      )}
    </div>
  ), [formatPrice, handleProductClick])

  // Statistiques mémoïsées
  const statsText = useMemo(() => {
    if (loading) return 'Chargement...'
    if (items.length === 0) return 'Aucune annonce'
    return `${count} annonce${count !== 1 ? 's' : ''} trouvée${count !== 1 ? 's' : ''}`
  }, [count, items.length, loading])

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
            Marketplace Djibtrade
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les meilleures annonces de produits et services à Djibouti
          </p>
        </div>
        
        {/* Filtres améliorés */}
        <div className="bg-white p-6 rounded-2xl shadow-soft mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <FiFilter className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtres de recherche</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Rechercher un produit, service..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages d'état */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center">
            <div className="flex-1">{error}</div>
            <button 
              onClick={fetchProducts}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Loading state amélioré */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Recherche des annonces en cours...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && items.length === 0 && !error && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-soft">
            <div className="text-8xl mb-6">📦</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune annonce trouvée</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
              {searchQuery || category 
                ? 'Essayez de modifier vos critères de recherche' 
                : 'Soyez le premier à publier une annonce !'
              }
            </p>
            {!searchQuery && !category && (
              <button 
                onClick={() => navigate('/create-product')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Publier une annonce
              </button>
            )}
          </div>
        )}

        {/* Grille de produits */}
        {!loading && items.length > 0 && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div className="text-gray-600 font-medium">
                {statsText}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {items.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        {/* Pagination améliorée */}
        {!loading && items.length > 0 && (nextPage || prevPage) && (
          <div className="bg-white rounded-2xl shadow-soft p-6 flex justify-between items-center">
            <button
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-30 transition-all duration-200 hover:bg-gray-50 rounded-lg"
              onClick={() => fetchProducts(prevPage)}
              disabled={!prevPage}
            >
              ⬅ Précédent
            </button>
            
            <div className="text-sm text-gray-600 font-medium">
              Page {Math.ceil((count - items.length) / items.length) + 1} sur {Math.ceil(count / items.length)}
            </div>
            
            <button
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg disabled:opacity-30 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => fetchProducts(nextPage)}
              disabled={!nextPage}
            >
              Suivant ➡
            </button>
          </div>
        )}
      </div>
    </div>
  )
}