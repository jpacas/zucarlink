const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Proveedor = require('../models/Proveedor')

const createPaymentIntent = async (req, res) => {
  try {
    const { plan, email, metadata } = req.body

    const amount = plan === 'monthly' ? 5000 : 50000 // $50 o $500 en centavos

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        ...metadata,
        email,
        plan,
      },
      description: `Suscripción ${
        plan === 'monthly' ? 'Mensual' : 'Anual'
      } - ${email}`,
      capture_method: 'automatic',
      confirm: false,
      setup_future_usage: 'off_session',
    })

    console.log('PaymentIntent created:', paymentIntent.id)

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Error creating PaymentIntent:', error)
    res.status(500).json({
      error: error.message,
      details: 'Error al crear el PaymentIntent',
    })
  }
}

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Error webhook:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    const { email, nombre, pais, paginaWeb, descripcion } =
      paymentIntent.metadata

    try {
      const nuevoProveedor = await Proveedor.create({
        nombre,
        email,
        pais,
        paginaWeb,
        descripcion,
        estado: 'activo',
        fechaRegistro: new Date(),
      })

      console.log('Proveedor creado:', nuevoProveedor)
      return res.json({ received: true })
    } catch (error) {
      console.error('Error al crear proveedor:', error)
      return res.status(500).json({ error: 'Error al crear proveedor' })
    }
  }

  res.json({ received: true })
}

module.exports = {
  createPaymentIntent,
  handleWebhook,
}
