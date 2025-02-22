const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const createPaymentIntent = async (req, res) => {
  try {
    const { plan, email } = req.body

    const amount = plan === 'basic' ? 5000 : 10000 // en centavos

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        email,
        plan,
      },
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  createPaymentIntent,
}
