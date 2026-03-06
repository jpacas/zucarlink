/**
 * Mapea un usuario de Sequelize a un objeto de respuesta para el frontend
 * @param {Object} usuario - Instancia de Usuario de Sequelize con relaciones incluidas
 * @param {Object} options - Opciones de mapeo
 * @param {boolean} options.includeIngenio - Incluir campo ingenio (default: true)
 * @param {boolean} options.includeProveedor - Incluir campo proveedor (default: true)
 * @returns {Object} Usuario mapeado para respuesta
 */
const mapUserToResponse = (usuario, options = {}) => {
  const { includeIngenio = true, includeProveedor = true } = options

  const mapped = {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    avatarUrl: usuario.avatarUrl,
    pais: usuario.pais?.nombre || null,
    area: usuario.area?.nombre || null,
    acercaDe: usuario.acercaDe,
  }

  if (includeIngenio) {
    mapped.ingenio = usuario.ingenio?.nombre || null
  }

  if (includeProveedor) {
    mapped.proveedor = usuario.proveedor?.nombre || null
  }

  return mapped
}

/**
 * Mapea una lista de usuarios
 * @param {Array} usuarios - Array de instancias de Usuario
 * @param {Object} options - Opciones de mapeo
 * @returns {Array} Array de usuarios mapeados
 */
const mapUsersToResponse = (usuarios, options = {}) => {
  return usuarios.map((usuario) => mapUserToResponse(usuario, options))
}

/**
 * Mapea una experiencia de Sequelize a un objeto de respuesta
 * @param {Object} experiencia - Instancia de Experiencia de Sequelize
 * @returns {Object} Experiencia mapeada para respuesta
 */
const mapExperienciaToResponse = (experiencia) => {
  return {
    id: experiencia.id,
    fechaInicio: experiencia.fechaInicio,
    fechaFin: experiencia.fechaFin,
    puesto: experiencia.puesto,
    descripcion: experiencia.descripcion,
    ingenio: experiencia.ingenio?.nombre || null,
    area: experiencia.area?.nombre || null,
    pais: experiencia.pais?.nombre || null,
  }
}

/**
 * Mapea una lista de experiencias
 * @param {Array} experiencias - Array de instancias de Experiencia
 * @returns {Array} Array de experiencias mapeadas
 */
const mapExperienciasToResponse = (experiencias) => {
  return experiencias.map(mapExperienciaToResponse)
}

module.exports = {
  mapUserToResponse,
  mapUsersToResponse,
  mapExperienciaToResponse,
  mapExperienciasToResponse,
}
