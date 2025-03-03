export interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  avatarUrl?: string
  pais: string
  ingenio?: string | null
  area?: string | null
  proveedor?: string | null
  acercaDe?: string | null
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

export interface Proveedor {
  nombre: string
  email: string
  webpage?: string
  logo?: string
  descripcion?: string
  pais?: string
}

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
    id: string
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
  login: (user: User) => void
  logout: () => void
}

export interface Ingenio {
  nombre: string
  pais: string
  correo?: string
  webpage?: string
}

export interface Empleo {
  id: number
  nombre: string
  descripcion: string
  contacto: string
  foto?: string
  views: number
  vigente: boolean
  createdAt: string
  updatedAt: string
  usuarioId: number
  paisId: number
  ingenioId: number
  areaId: number
  autor?: User
  archivos?: Archivo[]
  pais?: { id: number; nombre: string }
  area?: { id: number; nombre: string }
  ingenio?: { id: number; nombre: string }
}

export interface Maquinaria {
  id: number
  nombre: string
  descripcion: string
  foto?: string
  precio: number
  contacto: string
  marca: string
  modelo: string
  anio: number
  vistas: number
  vigente: boolean
  usuarioId: string
  pais: { id: number; nombre: string }
  usuario?: User
  archivos?: Archivo[]
  createdAt: Date
  updatedAt: Date
}
