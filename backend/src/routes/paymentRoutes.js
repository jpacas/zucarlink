const express = require('express')
const router = express.Router()
const {
  createPaymentIntent,
  handleWebhook,
} = require('../controllers/paymentController')
const { paymentLimiter } = require('../middleware/rateLimiter')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/create-payment-intent', authMiddleware, paymentLimiter, express.json(), createPaymentIntent)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
)

module.exports = router
