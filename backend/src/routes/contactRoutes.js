const express = require('express')
const nodemailer = require('nodemailer')
const router = express.Router()

router.post('/', async (req, res) => {
  const { name, email, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' })
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"${name}" <zucarlink@gmail.com>`,
      to: process.env.EMAIL_RECEIVER,
      subject: `Has recibido un mensaje de ${name} (${email})`,
      text: message,
      replyTo: email,
    })

    res.status(200).json({ message: 'Correo enviado exitosamente.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al enviar el correo.' })
  }
})

module.exports = router
