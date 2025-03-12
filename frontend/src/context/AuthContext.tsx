import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { User } from '../types/interfaces'
import { AuthContextType } from '../types/interfaces'
import { useNavigate } from 'react-router-dom'
import { setupAxiosInterceptors } from '../utils/axiosConfig'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('user') !== null
  })
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const navigate = useNavigate()

  const login = (user: User) => {
    if (!user || !user.id) {
      console.error('Error: usuario inválido al hacer login', user)
      return
    }
    setIsAuthenticated(true)
    setUser(user)
    localStorage.setItem('user', JSON.stringify(user))
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('zucarIA_conversation')
    navigate('/login')
  }

  useEffect(() => {
    // Configurar el interceptor de Axios con la función de logout
    setupAxiosInterceptors(logout)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
