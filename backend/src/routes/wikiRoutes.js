const express = require('express')
const router = express.Router()
const { getArticulos, getArticulo, createArticulo, updateArticulo } = require('../controllers/wikiController')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/', getArticulos)
router.get('/:slug', getArticulo)
router.post('/', authMiddleware, createArticulo)
router.put('/:slug', authMiddleware, updateArticulo)

module.exports = router
