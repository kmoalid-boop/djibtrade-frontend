import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { FiMenu, FiX, FiUser, FiSettings, FiLogOut, FiGrid } from 'react-icons/fi'

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Fermer le dropdown si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
    setShowDropdown(false)
    setMobileMenuOpen(false)
  }

  return (
    <header className="border-b border-gray-200 bg-white shadow-soft">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo texte avec dégradé bleu */}
        <Link to="/dashboard" className="flex items-center flex-shrink-0">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text font-bold text-xl md:text-2xl transition-all duration-300 hover:scale-105">
            DJIBTRADE
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link 
                to="/products" 
                className={`text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                  location.pathname === '/products' ? 'text-blue-600' : ''
                }`}
              >
                Annonces
              </Link>
              
              <Link 
                to="/dashboard" 
                className={`flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                  location.pathname === '/dashboard' ? 'text-blue-600' : ''
                }`}
              >
                <FiGrid className="mr-1" /> Tableau de bord
              </Link>

              <Link 
                to="/create-product" 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center"
              >
                <span className="mr-1">+</span> Publier
              </Link>

              {/* Menu utilisateur */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiUser className="text-blue-600 text-lg" />
                  </div>
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {user.company_name || user.full_name}
                  </span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-medium border border-gray-200 py-2 z-50 animate-slide-up">
                    <Link 
                      to="/settings" 
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FiSettings className="mr-2" /> Paramètres
                    </Link>
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FiUser className="mr-2" /> Mon Profil
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      onClick={handleLogout}
                    >
                      <FiLogOut className="mr-2" /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors px-4 py-2">
                Connexion
              </Link>
              <Link to="/register" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all">
                Créer un compte
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-700 p-2"
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
       >
         {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
       </button>
      </nav>

      {/* Mobile Navigation */}
      <div className={`md:hidden bg-white border-t border-gray-200 px-4 py-4 transition-all duration-300 ease-in-out ${
        mobileMenuOpen ? 'max-h-screen opacity-100 animate-slide-up' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        {user ? (
          <div className="space-y-4">
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2 block"
              onClick={() => setMobileMenuOpen(false)}
            >
              Annonces
            </Link>
            
            <Link 
              to="/dashboard" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2 flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiGrid className="mr-2" /> Tableau de bord
            </Link>

            <Link 
              to="/create-product" 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all mb-4 block text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Publier une annonce
            </Link>

            <div className="pt-4 border-t border-gray-200">
              <Link 
                to="/settings" 
                className="flex items-center text-gray-700 hover:text-blue-600 py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiSettings className="mr-2" /> Paramètres
              </Link>
              <Link 
                to="/profile" 
                className="flex items-center text-gray-700 hover:text-blue-600 py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiUser className="mr-2" /> Mon Profil
              </Link>
              <button
                className="flex items-center w-full text-left text-red-600 hover:text-red-700 py-2 transition-colors"
                onClick={handleLogout}
              >
                <FiLogOut className="mr-2" /> Déconnexion
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Link 
              to="/login" 
              className="text-gray-600 hover:text-blue-600 transition-colors py-2 block text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Connexion
            </Link>
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all block text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Créer un compte
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}