import { useState, useEffect, createContext, useContext } from 'react'

const AuthContext = createContext()

// Mock API URL - substitua pela URL real do backend quando disponível
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isPremium, setIsPremium] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(null)
  const [isBlocked, setIsBlocked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    // Verificar status a cada minuto
    const interval = setInterval(checkAuth, 60000)
    return () => clearInterval(interval)
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        // Modo offline/demo - permitir jogar sem autenticação
        setUser({ id: 'demo', email: 'demo@example.com' })
        setIsPremium(false)
        // Simular tentativas restantes (3 por padrão em modo demo)
        const storedAttempts = localStorage.getItem('demo_attempts_left')
        const attemptsDate = localStorage.getItem('demo_attempts_date')
        const today = new Date().toISOString().split('T')[0]
        
        if (attemptsDate !== today) {
          // Novo dia, resetar tentativas
          localStorage.setItem('demo_attempts_left', '3')
          localStorage.setItem('demo_attempts_date', today)
          setAttemptsLeft(3)
          setIsBlocked(false)
        } else {
          const attempts = parseInt(storedAttempts || '3', 10)
          setAttemptsLeft(attempts)
          setIsBlocked(attempts <= 0)
        }
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsPremium(data.isPremium || false)
        setAttemptsLeft(data.attemptsLeft)
        setIsBlocked(data.isBlocked || false)
      } else {
        // Token inválido, limpar
        localStorage.removeItem('token')
        setUser(null)
        setIsPremium(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Em caso de erro, permitir modo demo
      setUser({ id: 'demo', email: 'demo@example.com' })
      setIsPremium(false)
      const attempts = parseInt(localStorage.getItem('demo_attempts_left') || '3', 10)
      setAttemptsLeft(attempts)
      setIsBlocked(attempts <= 0)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        await checkAuth()
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.message || 'Login failed' }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsPremium(false)
    setAttemptsLeft(null)
    setIsBlocked(false)
  }

  const useAttempt = async () => {
    // Se for premium, não precisa consumir tentativa
    if (isPremium) {
      return { success: true, attemptsLeft: null }
    }

    // Modo demo - usar localStorage
    if (user?.id === 'demo') {
      const attempts = parseInt(localStorage.getItem('demo_attempts_left') || '3', 10)
      if (attempts <= 0) {
        setIsBlocked(true)
        return { success: false, blocked: true }
      }

      const newAttempts = attempts - 1
      localStorage.setItem('demo_attempts_left', newAttempts.toString())
      setAttemptsLeft(newAttempts)
      setIsBlocked(newAttempts <= 0)

      return { success: true, attemptsLeft: newAttempts }
    }

    // Modo real - chamar API
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/games/use-attempt`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAttemptsLeft(data.attemptsLeft)
        setIsBlocked(data.blocked || false)
        return { success: true, attemptsLeft: data.attemptsLeft }
      } else if (response.status === 429) {
        // Limite atingido
        setIsBlocked(true)
        return { success: false, blocked: true }
      } else {
        return { success: false, error: 'Failed to use attempt' }
      }
    } catch (error) {
      console.error('Use attempt failed:', error)
      return { success: false, error: error.message }
    }
  }

  const upgrade = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/subscription/create-checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Redirecionar para Stripe Checkout
        window.location.href = data.checkoutUrl
        return { success: true, checkoutUrl: data.checkoutUrl }
      } else {
        const error = await response.json()
        return { success: false, error: error.message || 'Failed to create checkout' }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const refresh = () => {
    return checkAuth()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isPremium,
        attemptsLeft,
        isBlocked,
        loading,
        login,
        logout,
        useAttempt,
        upgrade,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

