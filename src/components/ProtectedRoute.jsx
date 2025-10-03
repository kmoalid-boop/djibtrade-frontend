import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export default function ProtectedRoute({ children }) {
  const { access } = useAuth()
  const location = useLocation()

  if (!access) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}