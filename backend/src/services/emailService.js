const nodemailer = require('nodemailer')
const { Op } = require('sequelize')
const path = require('path')

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Necesario en algunos casos para desarrollo local
  },
})

// Verificar la conexión
transporter.verify(function (error, success) {
  if (error) {
    console.log('Error en la configuración del servidor de correo:', error)
  } else {
    console.log('Servidor de correo listo para enviar mensajes')
  }
})

// Función para enviar correo de recordatorio
const sendReminderEmail = async (to, messageInfo) => {
  const { senders, totalMessages } = messageInfo

  // Crear lista de remitentes
  const sendersList = senders
    .map((sender) => `<li style="margin-bottom: 8px;">${sender}</li>`)
    .join('')

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mensajes sin leer en Zucarlink</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding: 20px 0; text-align: center; background-color: #ffffff;">
            <img src="cid:logo-zucarlink" 
                 alt="Zucarlink Logo" 
                 style="width: 200px; height: auto; margin-bottom: 10px;">
          </td>
        </tr>
      </table>
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="padding: 30px;">
                <h2 style="color: #2C5282; text-align: center; margin-bottom: 30px; font-size: 24px;">
                  Tienes mensajes sin leer
                </h2>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                  <p style="color: #4A5568; font-size: 16px; line-height: 1.6;">
                    Hola,<br><br>
                    Tienes ${totalMessages} ${
    totalMessages === 1 ? 'mensaje pendiente' : 'mensajes pendientes'
  } de:
                  </p>
                  
                  <ul style="color: #4A5568; font-size: 16px; list-style-type: none; padding-left: 0;">
                    ${sendersList}
                  </ul>
                  
                  <p style="color: #4A5568; font-size: 16px; line-height: 1.6;">
                    No te pierdas de información importante. Por favor, revisa tus mensajes.
                  </p>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="https://zucarlink.com/" 
                       style="background-color: #2C5282; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; font-weight: bold;
                              display: inline-block;">
                      Ver mensajes
                    </a>
                  </div>
                </div>
              </div>
              
              <div style="background-color: #2C5282; padding: 20px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                <p style="color: #ffffff; text-align: center; margin: 0; font-size: 14px;">
                  © ${new Date().getFullYear()} Zucarlink - La red social de la industria azucarera
                </p>
                <p style="color: #E2E8F0; font-size: 12px; text-align: center; margin-top: 10px;">
                  Este es un correo automático, por favor no responder.
                </p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const mailOptions = {
    from: {
      name: 'Zucarlink',
      address: process.env.EMAIL_USER,
    },
    to: to,
    subject: `¡Tienes ${totalMessages} ${
      totalMessages === 1 ? 'mensaje sin leer' : 'mensajes sin leer'
    } en Zucarlink!`,
    html: htmlTemplate,
    attachments: [
      {
        filename: 'logo-zucarlink.png',
        path: path.join(__dirname, '../../public/images/logo-zucarlink.png'),
        cid: 'logo-zucarlink',
      },
    ],
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Correo de recordatorio enviado exitosamente')
    return true
  } catch (error) {
    console.error('Error al enviar correo de recordatorio:', error)
    throw error
  }
}

// Función para verificar y enviar recordatorios de mensajes no leídos
const checkUnreadMessagesAndSendReminders = async (Message, User) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    // Buscar mensajes no leídos más antiguos que 5 minutos
    const unreadMessages = await Message.findAll({
      where: {
        isRead: false,
        createdAt: {
          [Op.lt]: fiveMinutesAgo,
        },
        reminderSent: false,
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['nombre', 'apellido', 'email'],
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['nombre', 'apellido', 'email'],
        },
      ],
    })

    // Agrupar mensajes por destinatario
    const messagesByRecipient = unreadMessages.reduce((acc, message) => {
      const recipientEmail = message.recipient.email
      if (!acc[recipientEmail]) {
        acc[recipientEmail] = {
          recipient: message.recipient,
          messages: [],
          senders: new Set(),
        }
      }
      acc[recipientEmail].messages.push(message)
      acc[recipientEmail].senders.add(
        `${message.sender.nombre} ${message.sender.apellido}`
      )
      return acc
    }, {})

    // Enviar un correo por destinatario
    for (const [recipientEmail, data] of Object.entries(messagesByRecipient)) {
      await sendReminderEmail(recipientEmail, {
        senders: Array.from(data.senders),
        totalMessages: data.messages.length,
      })

      // Marcar todos los mensajes como notificados
      await Promise.all(
        data.messages.map((message) => message.update({ reminderSent: true }))
      )
    }

    return true
  } catch (error) {
    console.error('Error al procesar recordatorios:', error)
    throw error
  }
}

module.exports = {
  sendReminderEmail,
  checkUnreadMessagesAndSendReminders,
}
