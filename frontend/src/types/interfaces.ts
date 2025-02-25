export interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  proveedor: string | null //no esta retornando esto desde el backend
  avatarUrl?: string
  acercaDe: string
  pais: string
  ingenio: string | null
  area: string | null
}

export interface Experience {
  id: string | null
  cargo: string
  acercaDe: string
  ingenio: string
  area: string
  pais: string
  fechaInicio: string
  fechaFin: string
  actualmenteTrabaja: boolean
}

export type Pais = string

export type Area = string

export type Proveedor = string

export interface Archivo {
  id: number
  nombre: string
  url: string
  tipo: string
}

export interface Post {
  id: number
  titulo: string
  contenido: string
  views: number
  createdAt: string
  updatedAt: string
  usuarioId: string
  autor: {
    nombre: string
    apellido: string
    avatarUrl?: string
  }
  comments: Comment[]
  likes: Like[]
  area: {
    nombre: string
  }
  archivos?: Archivo[]
}

export interface Comment {
  id: number
  contenido: string
  usuarioId: string
  createdAt: string
  usuario: {
    nombre: string
    apellido: string
    avatarUrl?: string
  }
}

export interface Like {
  activo: boolean
  usuarioId: string
}

export interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (user: User) => void // Acepta un objeto `User`
  logout: () => void
}

export interface Ingenio {
  nombre: string
  pais: string
}
