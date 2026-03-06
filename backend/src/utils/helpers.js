/**
 * Parsea de forma segura un string JSON
 * @param {string} jsonString - El string JSON a parsear
 * @param {*} defaultValue - Valor por defecto si falla el parseo
 * @returns {*} El objeto parseado o el valor por defecto
 */
const safeParseJSON = (jsonString, defaultValue = []) => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Error al parsear JSON:', error)
    return defaultValue
  }
}

module.exports = {
  safeParseJSON,
}
