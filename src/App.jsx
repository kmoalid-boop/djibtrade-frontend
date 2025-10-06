import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './state/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import CreateProduct from './pages/CreateProduct'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Settings from './pages/Settings'
import EditProduct from './pages/EditProduct'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <NavBar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } />
            
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            
            <Route path="/create-product" element={
              <ProtectedRoute>
                <CreateProduct />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={
               <ProtectedRoute>
                 <Products />
              </ProtectedRoute>
           } />
            
            <Route 
              path="/edit-product/:id" 
              element={
                <ProtectedRoute>
                  <EditProduct />
                </ProtectedRoute>
              } 
            />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        
        {/* Footer avec texte bleu dégradé */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto py-6 md:py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-3 mb-4 md:mb-0">
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text font-bold text-lg md:text-xl">
                  DJIBTRADE
                </div>
                
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
                <a href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">À propos</a>
                <a href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
                <a href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">Confidentialité</a>
                <a href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">Conditions</a>
              </div>
            </div>
            <div className="text-center text-gray-500 text-xs mt-6">
              © {new Date().getFullYear()} Djibtrade. Tous droits réservés.
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  )
}

export default App
// Force deploy - $(date)