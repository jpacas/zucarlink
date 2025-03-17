const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Proveedor = require('../models/Proveedor')

// Definir los IDs de los productos de Stripe
const STRIPE_PRODUCTS = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID, // Añade estos IDs en tu .env
  yearly: process.env.STRIPE_YEARLY_PRICE_ID,
}

const createPaymentIntent = async (req, res) => {
  try {
    const { plan, email, metadata } = req.body

    console.log('Plan recibido:', plan)
    console.log('Email recibido:', email)
    console.log('Metadata recibida:', metadata)
    console.log('STRIPE_PRODUCTS:', STRIPE_PRODUCTS)
    console.log('Price ID a usar:', STRIPE_PRODUCTS[plan])

    // Verificar que el plan es válido y existe el ID del precio
    if (!plan || !STRIPE_PRODUCTS[plan]) {
      return res.status(400).json({
        error: 'Plan inválido o no configurado',
        details: `Plan '${plan}' no válido. Planes disponibles: ${Object.keys(
          STRIPE_PRODUCTS
        ).join(', ')}`,
        code: 'invalid_plan',
      })
    }

    // Verificar que el ID del precio no esté vacío
    if (!STRIPE_PRODUCTS[plan] || STRIPE_PRODUCTS[plan].trim() === '') {
      return res.status(400).json({
        error: 'ID de precio no configurado',
        details: `El ID de precio para el plan '${plan}' no está configurado en las variables de entorno`,
        code: 'missing_price_id',
      })
    }

    try {
      // Crear un cliente en Stripe
      const customer = await stripe.customers.create({
        email: email,
        metadata: metadata || {}, // Asegurarse de que metadata no sea null
      })

      console.log('Cliente creado:', customer.id)

      // Crear una suscripción con el precio correcto
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: STRIPE_PRODUCTS[plan],
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: metadata || {}, // Asegurarse de que metadata no sea null
      })

      console.log('Suscripción creada:', subscription.id)

      // Verificar que se creó el payment intent
      if (!subscription.latest_invoice.payment_intent) {
        throw new Error('No se pudo crear el payment intent')
      }

      // Devolver los datos necesarios al frontend
      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        paymentIntentId: subscription.latest_invoice.payment_intent.id,
      })
    } catch (stripeError) {
      console.error('Error detallado de Stripe:', {
        message: stripeError.message,
        code: stripeError.code,
        type: stripeError.type,
        param: stripeError.param,
        raw: stripeError.raw,
      })

      return res.status(400).json({
        error: stripeError.message,
        details: 'Error al procesar la solicitud en Stripe',
        code: stripeError.code,
        param: stripeError.param,
      })
    }
  } catch (error) {
    console.error('Error creating subscription:', error)
    res.status(500).json({
      error: error.message,
      details: 'Error al crear la suscripción',
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

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object
      try {
        // Buscar el proveedor por el paymentIntentId
        const proveedor = await Proveedor.findOne({
          where: { stripePaymentIntentId: paymentIntent.id },
        })

        if (proveedor) {
          // Actualizar el proveedor con los datos de Stripe
          await proveedor.update({
            estado: 'activo',
            stripeCustomerId: paymentIntent.customer,
          })
        }
      } catch (error) {
        console.error('Error al actualizar proveedor:', error)
      }
      break

    case 'customer.subscription.created':
      const subscription = event.data.object
      try {
        // Actualizar el proveedor con los datos de la suscripción
        await Proveedor.update(
          {
            stripeSubscriptionId: subscription.id,
            planType: subscription.items.data[0].price.recurring.interval,
          },
          {
            where: { stripeCustomerId: subscription.customer },
          }
        )
      } catch (error) {
        console.error('Error al actualizar suscripción del proveedor:', error)
      }
      break

    case 'customer.subscription.deleted':
      const canceledSubscription = event.data.object
      try {
        await Proveedor.update(
          {
            estado: 'inactivo',
            stripeSubscriptionId: null,
            planType: null,
          },
          {
            where: { stripeSubscriptionId: canceledSubscription.id },
          }
        )
      } catch (error) {
        console.error('Error al actualizar estado del proveedor:', error)
      }
      break
  }

  res.json({ received: true })
}

module.exports = {
  createPaymentIntent,
  handleWebhook,
}
