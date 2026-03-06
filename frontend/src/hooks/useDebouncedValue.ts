import { useState, useEffect } from 'react'

/**
 * Hook para debounce de valores
 * Útil para evitar llamadas excesivas a API en campos de búsqueda
 *
 * @param value - Valor a debouncer
 * @param delay - Tiempo de espera en ms (default: 300ms)
 * @returns Valor debounced
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearch = useDebouncedValue(searchTerm, 500)
 *
 * useEffect(() => {
 *   // Esta llamada solo se hace 500ms después del último cambio
 *   fetchResults(debouncedSearch)
 * }, [debouncedSearch])
 */
export const useDebouncedValue = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para debounce de callbacks
 * Útil cuando necesitas debouncer una función en lugar de un valor
 *
 * @param callback - Función a ejecutar
 * @param delay - Tiempo de espera en ms
 * @returns Función debounced
 */
export const useDebouncedCallback = <T extends (...args: never[]) => void>(
  callback: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const debouncedCallback = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args)
    }, delay)

    setTimeoutId(newTimeoutId)
  }

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  return debouncedCallback
}

export default useDebouncedValue
