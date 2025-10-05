import { useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Login() {
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/products'

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const res = await login(email, password)
    if (res.ok) {
      navigate(from, { replace: true })
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 card">
      <h1 className="text-2xl font-semibold mb-2">Connexion</h1>
      <p className="text-sm text-gray-600 mb-6">
        Connectez-vous pour gérer vos annonces.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Mot de passe</label>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        {error && <div className="text-sm text-red-600">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
        
       <div className="text-sm text-center mt-4">
       <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
             Mot de passe oublié?
       </Link>
       </div>
      </form>
      <div className="mt-8 text-center">
  <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-soft">
    <p className="text-lg font-bold text-gray-900 mb-2">💼 Vous êtes grossiste ?</p>
    <p className="text-gray-600 mb-4">
      Rejoignez DjibTrade et développez votre business en ligne
    </p>
    <Link 
      to="/register" 
      className="inline-block bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      📈 Créer mon compte professionnel
    </Link>
  </div>
</div>
    </div>
  )
}