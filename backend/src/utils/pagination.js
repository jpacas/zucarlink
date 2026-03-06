/**
 * Parsea y valida los parámetros de paginación
 * @param {Object} query - Objeto con los parámetros de query (page, limit)
 * @param {number} maxLimit - Límite máximo de items por página (por defecto 50)
 * @returns {Object} { page, limit, offset } - Parámetros de paginación validados
 */
const parsePaginationParams = (query, maxLimit = 50) => {
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || 10))
  const offset = (page - 1) * limit
  return { page, limit, offset }
}

/**
 * Construye el objeto de respuesta de paginación
 * @param {number} count - Total de items
 * @param {number} page - Página actual
 * @param {number} limit - Items por página
 * @returns {Object} Objeto con información de paginación
 */
const buildPaginationResponse = (count, page, limit) => {
  const totalPages = Math.ceil(count / limit)
  return {
    currentPage: page,
    totalPages,
    totalItems: count,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

module.exports = {
  parsePaginationParams,
  buildPaginationResponse,
}
