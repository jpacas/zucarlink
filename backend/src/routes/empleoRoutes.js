const express = require('express')
const { getEmpleos, createEmpleo } = require('../controllers/empleoController')
const upload = require('../middleware/multer') // Para imágenes
const router = express.Router()

router.get('/', getEmpleos)
router.post('/', upload.single('foto'), createEmpleo)

module.exports = router
