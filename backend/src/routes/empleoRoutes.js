const express = require('express')
const router = express.Router()
const empleoController = require('../controllers/empleoController')
const upload = require('../middleware/multer')

router.get('/', empleoController.getAllEmpleos)
router.get('/:id', empleoController.getEmpleoById)
router.post('/', upload.array('archivos'), empleoController.createEmpleo)
router.put('/:id', upload.array('archivos'), empleoController.updateEmpleo)
router.delete('/:id', empleoController.deleteEmpleo)

module.exports = router
