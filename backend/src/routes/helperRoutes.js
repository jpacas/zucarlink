const express = require('express')
const upload = require('../middleware/multer')
const {
  getPaises,
  getAreas,
  getIngenios,
  getProveedores,
  registerProveedor,
  getProveedorById,
} = require('../controllers/helperController')
const router = express.Router()

router.get('/paises', getPaises)
router.get('/areas', getAreas)
router.get('/ingenios', getIngenios)
router.get('/proveedores', getProveedores)
router.post('/registerProveedor', upload.single('logo'), registerProveedor)
router.get('/proveedores/:id', getProveedorById)
module.exports = router
