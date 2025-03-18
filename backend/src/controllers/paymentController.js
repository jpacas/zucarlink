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

      // Actualizar el proveedor con el stripeCustomerId
      if (metadata?.proveedorId) {
        const proveedor = await Proveedor.findByPk(metadata.proveedorId)
        if (proveedor) {
          await proveedor.update({
            stripeCustomerId: customer.id,
          })
        } else {
          console.error(
            'No se encontró el proveedor para actualizar:',
            metadata.proveedorId
          )
        }
      }

      // Crear una suscripción con el precio correcto
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: STRIPE_PRODUCTS[plan],
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
          payment_method_types: ['card'],
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          ...metadata,
          customerId: customer.id,
        },
      })

      // Verificar que se creó el payment intent
      if (!subscription.latest_invoice.payment_intent) {
        throw new Error('No se pudo crear el payment intent')
      }

      // Actualizar el payment intent con los metadatos
      await stripe.paymentIntents.update(
        subscription.latest_invoice.payment_intent.id,
        {
          metadata: {
            ...metadata,
            customerId: customer.id,
          },
        }
      )

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
        // Obtener el ID del proveedor de los metadatos
        const proveedorId = paymentIntent.metadata.proveedorId

        if (!proveedorId) {
          console.error(
            'No se encontró proveedorId en los metadatos del payment intent'
          )
          return
        }

        // Buscar el proveedor por ID
        const proveedor = await Proveedor.findByPk(proveedorId)

        if (!proveedor) {
          console.error('No se encontró el proveedor con ID:', proveedorId)
          return
        }

        // Actualizar el proveedor con los datos de Stripe y estado activo
        await proveedor.update({
          estado: 'activo',
          stripeCustomerId: paymentIntent.customer,
          stripePaymentIntentId: paymentIntent.id,
        })
      } catch (error) {
        console.error('Error al actualizar proveedor:', error)
      }
      break

    case 'customer.subscription.created':
      const subscription = event.data.object

      try {
        // Buscar el proveedor por stripeCustomerId o por proveedorId en los metadatos
        let proveedor = await Proveedor.findOne({
          where: { stripeCustomerId: subscription.customer },
        })

        if (!proveedor && subscription.metadata?.proveedorId) {
          proveedor = await Proveedor.findByPk(
            subscription.metadata.proveedorId
          )
        }

        if (!proveedor) {
          console.error('No se encontró el proveedor para la suscripción:', {
            subscriptionId: subscription.id,
            customerId: subscription.customer,
            metadata: subscription.metadata,
          })
          return
        }

        // Actualizar solo los datos de la suscripción, sin cambiar el estado
        await proveedor.update({
          stripeSubscriptionId: subscription.id,
          planType: subscription.items.data[0].price.recurring.interval,
          stripeCustomerId: subscription.customer,
        })
      } catch (error) {
        console.error(
          'Error detallado al actualizar suscripción del proveedor:',
          {
            error: error.message,
            stack: error.stack,
            subscriptionId: subscription.id,
            customerId: subscription.customer,
            metadata: subscription.metadata,
          }
        )
      }
      break

    case 'customer.subscription.deleted':
      const canceledSubscription = event.data.object

      try {
        const proveedor = await Proveedor.findOne({
          where: { stripeSubscriptionId: canceledSubscription.id },
        })

        await proveedor.update({
          estado: 'inactivo',
          stripeSubscriptionId: null,
          planType: null,
        })
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
