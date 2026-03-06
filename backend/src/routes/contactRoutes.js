const express = require('express')
const router = express.Router()
const { sendEmail } = require('../controllers/contactController')
const { contactValidators } = require('../middleware/validators/contactValidators')

router.post('/', contactValidators, sendEmail)

module.exports = router
