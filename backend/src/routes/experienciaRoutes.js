const express = require('express')
const router = express.Router()
const {
  getExperiencias,
  createExperiencia,
  deleteExperience,
  updateExperiencia,
} = require('../controllers/experienciaController')

// Rutas para manejar las operaciones de experiencia
router.get('/:userId', getExperiencias)
router.post('/:userId', createExperiencia)
router.delete('/:expId', deleteExperience)
router.put('/:expId', updateExperiencia)

module.exports = router
