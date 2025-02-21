const express = require('express')
const {
  getPaises,
  getAreas,
  getIngenios,
} = require('../controllers/helperController')
const router = express.Router()

router.get('/paises', getPaises)
router.get('/areas', getAreas)
router.get('/ingenios', getIngenios)

module.exports = router
