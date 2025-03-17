const express = require('express')
const router = express.Router()
const {
  createPaymentIntent,
  handleWebhook,
} = require('../controllers/paymentController')

router.post('/create-payment-intent', express.json(), createPaymentIntent)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
)

module.exports = router
