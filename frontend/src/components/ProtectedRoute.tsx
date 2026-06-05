import { Navigate, useLocation } from 'react-router-dom'
import { getUsuario, podeAcessar } from '../utils/auth'

type ProtectedRouteProps = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const usuario = getUsuario()
  const publica = ['/login', '/cadastro'].includes(location.pathname)

  if (!usuario && !publica) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (usuario && !podeAcessar(location.pathname, usuario)) {
    return <Navigate to="/" replace />
  }

  return children
}
