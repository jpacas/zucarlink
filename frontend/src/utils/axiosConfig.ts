import axios from 'axios'

// Crear una instancia de axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  /* headers: {
    'Content-Type': 'application/json',
  }, */
})

// Variable para almacenar la función de logout
let logoutFunction: (() => void) | null = null

// Función para configurar el logout
export const setupAxiosInterceptors = (logout: () => void) => {
  logoutFunction = logout

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        // Si el token está expirado (401) o es inválido (403)
        if (error.response.status === 401 || error.response.status === 403) {
          // Ejecutar logout si está disponible
          if (logoutFunction) {
            logoutFunction()
          }
        }
      }
      return Promise.reject(error)
    }
  )
}

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axiosInstance
