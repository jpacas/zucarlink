import { createContext, useContext, useState, ReactNode } from 'react'

interface User {
  id: string
  nombre: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (user: User) => void // Acepta un objeto `User`
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)

  const login = (user: User) => {
    // Recibe un objeto `User`
    setIsAuthenticated(true)
    setUser(user)
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('token')
  }

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
