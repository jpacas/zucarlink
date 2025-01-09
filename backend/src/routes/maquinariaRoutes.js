const express = require('express')
const {
  getMaquinaria,
  createMaquinaria,
} = require('../controllers/maquinariaController')
const upload = require('../middleware/multer') // Para imágenes
const router = express.Router()

router.get('/', getMaquinaria)
router.post('/', upload.single('foto'), createMaquinaria)

module.exports = router
