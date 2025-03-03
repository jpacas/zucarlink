import { createContext, useContext, useState, ReactNode } from 'react'
import { User } from '../types/interfaces'
import { AuthContextType } from '../types/interfaces'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('user') !== null
  })
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const login = (user: User) => {
    if (!user || !user.id) {
      console.error('Error: usuario inválido al hacer login', user)
      return
    }
    setIsAuthenticated(true)
    setUser(user)
    localStorage.setItem('user', JSON.stringify(user)) // Guarda el usuario en localStorage
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('zucarIA_conversation') // Borra la conversación de ZucarIA al salir
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
