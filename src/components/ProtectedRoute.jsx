import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const guestAttempts = parseInt(localStorage.getItem('guest_attempts') || '3', 10);

  // Permitir acesso se estiver autenticado OU se ainda tiver tentativas de convidado
  if (!isAuthenticated && guestAttempts <= 0) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
