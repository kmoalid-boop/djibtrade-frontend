import { useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../state/AuthContext'
import { FiEye, FiEdit, FiTrash2, FiPlus, FiBox, FiImage } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../utils/imageUtils'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    userProductsCount: 0,
    totalViews: 0,
    activeProducts: 0
  })
  const [userProducts, setUserProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // Charger les annonces de l'utilisateur
        const productsResponse = await api.get('/annonces/user-products/')
        setUserProducts(productsResponse.data)
        
        // Calculer les statistiques basées sur les annonces de l'utilisateur
        const userProductsCount = productsResponse.data.length
        const totalViews = productsResponse.data.reduce((total, product) => total + (product.views || 0), 0)
        const activeProducts = productsResponse.data.filter(product => product.stock > 0).length
        
        setStats({
          userProductsCount,
          totalViews,
          activeProducts
        })
      } catch (e) {
        console.error('Erreur lors du chargement:', e)
        setError('Impossible de charger vos annonces')
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      fetchData()
    }
  }, [user])

  const formatPrice = (price, currency) => {
    if (currency === 'DJF') {
      return new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 0
      }).format(price) + ' DJF'
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const deleteProduct = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      try {
        await api.delete(`/annonces/products/${productId}/`)
        setUserProducts(userProducts.filter(product => product.id !== productId))
        // Mettre à jour les stats
        setStats(prev => ({
          ...prev,
          userProductsCount: prev.userProductsCount - 1
        }))
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        alert('Erreur lors de la suppression de l\'annonce')
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Bienvenue {user?.company_name || user?.full_name}</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 text-sm">Mes annonces</div>
          <div className="text-3xl font-bold text-blue-600">{stats.userProductsCount}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 text-sm">Total de vues</div>
          <div className="text-3xl font-bold text-green-600">{stats.totalViews}</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-500 text-sm">Annonces actives</div>
          <div className="text-3xl font-bold text-purple-600">{stats.activeProducts}</div>
        </div>
      </div>

      {/* Section Mes annonces */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Mes annonces</h2>
          <Link 
            to="/create-product" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
          >
            <FiPlus className="mr-2" /> Nouvelle annonce
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de vos annonces...</p>
          </div>
        ) : userProducts.length === 0 ? (
          <div className="text-center py-12">
            <FiBox className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune annonce publiée</h3>
            <p className="text-gray-600 mb-6">Commencez par créer votre première annonce</p>
            <Link 
              to="/create-product" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Créer une annonce
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {userProducts.map(product => (
              <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-gray-200">
                  {product.image ? (
                    <img 
                      src={getImageUrl(product.image)} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                    <FiImage className="text-4xl text-gray-400" />
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-blue-600 font-bold">
                      {formatPrice(product.unit_price, product.currency)}
                    </span>
                    {product.stock > 0 ? (
                      <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                        {product.stock} en stock
                      </span>
                    ) : (
                      <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded">
                        Rupture de stock
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <FiEye className="mr-1" /> {product.views || 0} vues
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Link 
                      to={`/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Voir détails
                    </Link>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/edit-product/${product.id}`}
                        className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50"
                        title="Modifier l'annonce"
                      >
                        <FiEdit size={18} />
                      </Link>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                        title="Supprimer l'annonce"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}