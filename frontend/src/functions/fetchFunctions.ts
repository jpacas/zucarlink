import axios from 'axios'
import axiosInstance from '../utils/axiosConfig'
import { Ingenio, Area, Proveedor } from '../types/interfaces'

export const fetchAreas = async () => {
  try {
    const response = await axiosInstance.get<{ nombre: Area }[]>('/helper/areas')
    return { areas: response.data.map((area) => area.nombre), error: null }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return {
        error: err.response?.data?.message || 'Error al cargar las Areas.',
      }
    } else {
      return { error: 'Error desconocido.' }
    }
  }
}

export const fetchIngenios = async () => {
  try {
    const response = await axiosInstance.get<Ingenio[]>('/helper/ingenios')
    return {
      ingenios: response.data,
      error: null,
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return {
        error: err.response?.data?.message || 'Error al cargar Ingenios.',
      }
    } else {
      return { error: 'Error desconocido.' }
    }
  }
}

export const fetchPaises = async () => {
  try {
    const response = await axiosInstance.get<{ nombre: string }[]>('/helper/paises')
    return { paises: response.data.map((pais) => pais.nombre), error: null }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return {
        error: err.response?.data?.message || 'Error al cargar los paises.',
      }
    } else {
      return { error: 'Error desconocido.' }
    }
  }
}

export const fetchProveedores = async () => {
  try {
    const response = await axiosInstance.get<Proveedor[]>('/helper/proveedores')
    return {
      proveedores: response.data,
      error: null,
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return {
        error:
          err.response?.data?.message || 'Error al cargar los proveedores.',
      }
    } else {
      return { error: 'Error desconocido.' }
    }
  }
}
