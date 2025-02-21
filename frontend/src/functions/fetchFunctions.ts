import axios from 'axios'
import { Ingenio } from '../types/interfaces'

export const fetchAreas = async () => {
  try {
    const response = await axios.get<{ nombre: string }[]>(
      `${import.meta.env.VITE_API_URL}/helper/areas`
    )
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
    const response = await axios.get<Ingenio[]>(
      `${import.meta.env.VITE_API_URL}/helper/ingenios`
    )
    return { ingenios: response.data, error: null }
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
    const response = await axios.get<{ nombre: string }[]>(
      `${import.meta.env.VITE_API_URL}/helper/paises`
    )
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
