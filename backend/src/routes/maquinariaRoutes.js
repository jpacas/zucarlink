const express = require('express')
const {
  getMaquinaria,
  getMaquinariaById,
  createMaquinaria,
  updateMaquinaria,
  deleteMaquinaria,
} = require('../controllers/maquinariaController')
const upload = require('../middleware/multer')

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
router.post('/', upload.fields(uploadFields), createMaquinaria)
router.put('/:id', upload.fields(uploadFields), updateMaquinaria)
router.delete('/:id', deleteMaquinaria)

module.exports = router
