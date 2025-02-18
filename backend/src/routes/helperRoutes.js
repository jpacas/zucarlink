const express = require('express')
const { getPaises, getAreas } = require('../controllers/helperController')
const router = express.Router()

router.get('/paises', getPaises)
router.get('/areas', getAreas)

module.exports = router
