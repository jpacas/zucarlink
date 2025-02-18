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

export interface Area {
  nombre: string
}
