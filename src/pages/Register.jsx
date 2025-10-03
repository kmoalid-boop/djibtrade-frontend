import { useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const { register, loading } = useAuth()
  const [form, setForm] = useState({
    email: '',
    password: '',
    password2: '',
    full_name: '',
    company_name: '',
    phone: '',
    address: '',
    city: '',
  })
  const [error, setError] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    
    // Validation des mots de passe
    if (form.password !== form.password2) {
      return setError("Les mots de passe ne correspondent pas")
    }
    
    const res = await register(form)
    if (res.ok) {
      setIsSuccess(true)
      // Redirection après 3 secondes
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 3000)
    } else {
      setError(res.error)
    }
  }

  // Afficher la page de succès après inscription
  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto mt-12 card text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Inscription réussie !</h2>
        <p className="text-gray-600 mb-6">
          Votre compte a été créé avec succès. Vous serez redirigé vers votre tableau de bord dans quelques instants.
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-green-600 h-2 rounded-full animate-progress"></div>
        </div>
        <p className="text-sm text-gray-500">
          Si la redirection ne fonctionne pas, <Link to="/dashboard" className="text-sky-700">cliquez ici</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto mt-12 card">
      <h1 className="text-2xl font-semibold mb-2">Créer un compte</h1>
      <p className="text-sm text-gray-600 mb-6">
        Rejoignez Djibtrade et commencez à publier vos annonces grossistes.
      </p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm mb-1">Nom complet *</label>
          <input className="input" name="full_name" value={form.full_name} onChange={onChange} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Nom de l'entreprise</label>
          <input className="input" name="company_name" value={form.company_name} onChange={onChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Email *</label>
            <input className="input" type="email" name="email" value={form.email} onChange={onChange} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Téléphone *</label>
            <input className="input" name="phone" value={form.phone} onChange={onChange} required />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Ville</label>
            <input className="input" name="city" value={form.city} onChange={onChange} />
          </div>
          <div>
            <label className="block text-sm mb-1">Adresse</label>
            <input className="input" name="address" value={form.address} onChange={onChange} />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Mot de passe *</label>
          <input className="input" type="password" name="password" value={form.password} onChange={onChange} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Confirmer le mot de passe *</label>
          <input className="input" type="password" name="password2" value={form.password2} onChange={onChange} required />
        </div>
        {error && <div className="text-sm text-red-600">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Création…' : 'Créer le compte'}
        </button>
      </form>
      <div className="mt-4 text-sm">
        Déjà un compte ? <Link className="text-sky-700" to="/login">Se connecter</Link>
      </div>
    </div>
  )
}