const express = require('express')
const router = express.Router()
const { trackView, getEmpresaAnalytics } = require('../controllers/analyticsController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/track', trackView) // No auth needed for tracking (anonymous views too)
router.get('/empresa/:proveedorId', authMiddleware, getEmpresaAnalytics)

module.exports = router
