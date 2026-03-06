import { useState, useEffect, useMemo } from 'react'

interface Ingenio {
  id: number
  nombre: string
  pais: string
}

interface UseFilteredIngeniosProps {
  ingenios: Ingenio[]
  selectedPais: string
  selectedIngenio: string
  onIngenioReset?: () => void
}

interface UseFilteredIngeniosReturn {
  ingeniosFiltrados: Ingenio[]
  shouldResetIngenio: boolean
}

/**
 * Hook para filtrar ingenios por país seleccionado
 * Elimina la duplicación de lógica en Empleos, Maquinarias, Directorio, etc.
 *
 * @param ingenios - Lista completa de ingenios
 * @param selectedPais - País seleccionado actualmente
 * @param selectedIngenio - Ingenio seleccionado actualmente
 * @param onIngenioReset - Callback opcional cuando el ingenio debe resetearse
 * @returns ingeniosFiltrados - Lista de ingenios filtrados por país
 */
export const useFilteredIngenios = ({
  ingenios,
  selectedPais,
  selectedIngenio,
  onIngenioReset,
}: UseFilteredIngeniosProps): UseFilteredIngeniosReturn => {
  const [shouldResetIngenio, setShouldResetIngenio] = useState(false)

  // Memoizar el filtrado para evitar recálculos innecesarios
  const ingeniosFiltrados = useMemo(() => {
    if (!selectedPais) {
      return ingenios
    }

    return ingenios.filter(
      (ingenio) => ingenio.pais.toLowerCase() === selectedPais.toLowerCase()
    )
  }, [ingenios, selectedPais])

  // Verificar si el ingenio seleccionado sigue siendo válido
  useEffect(() => {
    if (selectedPais && selectedIngenio) {
      const ingenioExiste = ingeniosFiltrados.some(
        (ing) => ing.nombre.toLowerCase() === selectedIngenio.toLowerCase()
      )

      if (!ingenioExiste) {
        setShouldResetIngenio(true)
        if (onIngenioReset) {
          onIngenioReset()
        }
      } else {
        setShouldResetIngenio(false)
      }
    } else {
      setShouldResetIngenio(false)
    }
  }, [selectedPais, selectedIngenio, ingeniosFiltrados, onIngenioReset])

  return {
    ingeniosFiltrados,
    shouldResetIngenio,
  }
}

export default useFilteredIngenios
