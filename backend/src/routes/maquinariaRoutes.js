const express = require('express')
const {
  getMaquinaria,
  getMaquinariaById,
  createMaquinaria,
  updateMaquinaria,
  deleteMaquinaria,
} = require('../controllers/maquinariaController')
const upload = require('../middleware/multer')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// Configurar campos para multer
const uploadFields = [
  { name: 'foto', maxCount: 1 },
  { name: 'archivos', maxCount: 5 }, // Máximo 5 archivos adjuntos
]

// Rutas públicas
router.get('/', getMaquinaria)
router.get('/:id', getMaquinariaById)

// Rutas protegidas
router.post('/', authMiddleware, upload.fields(uploadFields), createMaquinaria)
router.put('/:id', authMiddleware, upload.fields(uploadFields), updateMaquinaria)
router.delete('/:id', authMiddleware, deleteMaquinaria)

module.exports = router
