export interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  proveedor: string //no esta retornando esto desde el backend
  avatarUrl?: string
  acercaDe: string
  pais: { nombre: string }
  ingenio: { nombre: string }
  area: { nombre: string }
}

export interface Experience {
  id: string | null
  cargo: string
  acercaDe: string
  ingenio: string
  area: string
  fechaInicio: string
  fechaFin: string
  actualmenteTrabaja: boolean
}

export type Pais = string

export type Area = string

export interface Post {
  id: number
  titulo: string
  contenido: string
  area: string
  createdAt: string
  usuarioId: number
  autor: { id: number; nombre: string; apellido: string; avatarUrl?: string }
  comments: Comment[]
  likes: string[]
}

export interface Comment {
  user: string
  nombre: string
  apellido: string
  value: string
}
