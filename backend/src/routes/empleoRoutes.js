const express = require('express')
const router = express.Router()
const empleoController = require('../controllers/empleoController')
const upload = require('../middleware/multer')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/', empleoController.getAllEmpleos)
router.get('/:id', empleoController.getEmpleoById)
router.post(
  '/',
  authMiddleware,
  upload.array('archivos'),
  empleoController.createEmpleo
)
router.put(
  '/:id',
  authMiddleware,
  upload.array('archivos'),
  empleoController.updateEmpleo
)
router.delete('/:id', authMiddleware, empleoController.deleteEmpleo)

module.exports = router
