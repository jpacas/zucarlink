import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

// Crear una instancia de axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Variable para almacenar la función de logout
let logoutFunction: (() => void) | null = null

// Variable para controlar si ya se está renovando el token
let isRefreshing = false

// Cola de peticiones pendientes mientras se renueva el token
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: Error) => void
}> = []

// Procesar la cola de peticiones pendientes
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Función para renovar el token
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/users/refresh-token`,
    { refreshToken }
  )

  const { token, refreshToken: newRefreshToken } = response.data

  // Guardar los nuevos tokens
  localStorage.setItem('token', token)
  localStorage.setItem('refreshToken', newRefreshToken)

  return token
}

// Función para configurar el logout
export const setupAxiosInterceptors = (logout: () => void) => {
  logoutFunction = logout
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

// Interceptor para manejar respuestas y renovar tokens
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Si el error no es 401 o ya se intentó reintentar, rechazar
    if (error.response?.status !== 401 || originalRequest._retry) {
      // Si es 403, hacer logout
      if (error.response?.status === 403 && logoutFunction) {
        logoutFunction()
      }
      return Promise.reject(error)
    }

    // Si ya se está renovando el token, agregar a la cola
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(axiosInstance(originalRequest))
          },
          reject: (err: Error) => {
            reject(err)
          },
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const newToken = await refreshAccessToken()
      processQueue(null, newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError as Error, null)
      // Si la renovación falla, hacer logout
      if (logoutFunction) {
        logoutFunction()
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default axiosInstance
