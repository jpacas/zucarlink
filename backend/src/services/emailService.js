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
    // En producción siempre validar certificados para prevenir ataques MITM
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
})

// Verificar la conexión (evitar fallos en dev cuando no hay credenciales reales)
if (process.env.NODE_ENV === 'production') {
  transporter.verify(function (error, success) {
    if (error) {
      console.log('Error en la configuración del servidor de correo:', error)
    } else {
      console.log('Servidor de correo listo para enviar mensajes')
    }
  })
}

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
            <img src="https://sawa-dev-2-storage-bucket.storage.googleapis.com/profiles/xhcujhfcadwkupzz-88efb.png" 
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

// Función para enviar correo de bienvenida
const sendWelcomeEmail = async (to, userName) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Bienvenido a Zucarlink!</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding: 20px 0; text-align: center; background-color: #ffffff;">
            <img src="https://sawa-dev-2-storage-bucket.storage.googleapis.com/profiles/xhcujhfcadwkupzz-88efb.png" 
                 alt="Zucarlink Logo" 
                 style="width: 200px; height: auto; margin-bottom: 10px;">
          </td>
        </tr>
      </table>
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td>
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div>
                <h2 style="color: #e5533f; text-align: center; font-size: 24px; background-color: #f8f9fa; padding: 20px; margin: 0; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  ¡Bienvenido a Zucarlink!
                </h2>
                
                <div style="background-color: #f8f9fa; border-radius: 0 0 5px 5px; margin: 0 0 20px 0; padding: 20px;">
                  <p style="color: #4A5568; font-size: 16px; line-height: 1.6;">
                    Hola ${userName},<br><br>
                    ¡Nos alegra mucho tenerte en nuestra comunidad! Zucarlink es la red social especializada en la industria azucarera, donde podrás:
                  </p>
                  
                  <ul style="color: #4A5568; font-size: 16px; list-style-type: none; padding-left: 0;">
                    <li style="margin-bottom: 10px;">✓ Conectar con profesionales de la industria</li>
                    <li style="margin-bottom: 10px;">✓ Compartir experiencias y conocimientos</li>
                    <li style="margin-bottom: 10px;">✓ Utilizar ZucarIA como tu asistente tecnico</li>
                    <li style="margin-bottom: 10px;">✓ Acceder a oportunidades laborales</li>
                    <li style="margin-bottom: 10px;">✓ Comprar y vender equipos y maquinaria</li>
                  </ul>
                  
                  <p style="color: #4A5568; font-size: 16px; line-height: 1.6;">
                    Te invitamos a completar tu perfil y comenzar a interactuar con otros miembros de la comunidad.
                  </p>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="https://zucarlink.com/" 
                       style="background-color: #e5533f; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; font-weight: bold;
                              display: inline-block;">
                      Completar mi perfil
                    </a>
                  </div>
                </div>
              </div>
              
              <div style="background-color: #e5533f; padding: 20px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
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
    subject: '¡Bienvenido a Zucarlink!',
    html: htmlTemplate,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Correo de bienvenida enviado exitosamente')
    return true
  } catch (error) {
    console.error('Error al enviar correo de bienvenida:', error)
    throw error
  }
}

// Función para enviar notificación de nuevo post
const sendNewPostNotification = async (to, userName, postInfo) => {
  const { titulo, contenido, autor } = postInfo

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuevo mensaje de tu área - Zucarlink</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding: 20px 0; text-align: center; background-color: #ffffff;">
            <img src="https://sawa-dev-2-storage-bucket.storage.googleapis.com/profiles/xhcujhfcadwkupzz-88efb.png" 
                 alt="Zucarlink Logo" 
                 style="width: 200px; height: auto; margin-bottom: 10px;">
          </td>
        </tr>
      </table>
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td>
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div>
                <h2 style="color: #e5533f; text-align: center; font-size: 24px; background-color: #f8f9fa; padding: 20px; margin: 0; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  Nuevo mensaje en tu área
                </h2>
                
                <div style="background-color: #f8f9fa; border-radius: 0 0 5px 5px; margin: 0 0 20px 0; padding: 20px;">
                  <p style="color: #4A5568; font-size: 16px; line-height: 1.6;">
                    Hola ${userName},<br><br>
                    ${autor} ha compartido un nuevo mensaje en tu área:
                  </p>
                  
                  <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3 style="color: #2C5282; margin: 0 0 10px 0; font-size: 18px;">
                      ${titulo}
                    </h3>
                    <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin: 0;">
                      ${contenido.substring(0, 150)}${
    contenido.length > 100 ? '...' : ''
  }
                    </p>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="https://zucarlink.com/" 
                       style="background-color: #e5533f; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; font-weight: bold;
                              display: inline-block;">
                      Ver mensaje completo
                    </a>
                  </div>
                </div>
              </div>
              
              <div style="background-color: #e5533f; padding: 20px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
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
    subject: 'Nuevo mensaje en el foro - Zucarlink',
    html: htmlTemplate,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Notificación de nuevo post enviada exitosamente')
    return true
  } catch (error) {
    console.error('Error al enviar notificación de nuevo post:', error)
    throw error
  }
}

// Función para verificar y enviar notificaciones de nuevos posts
const checkNewPostsAndSendNotifications = async (Post, User, Area) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Buscar posts creados en las últimas 24 horas
    const recentPosts = await Post.findAll({
      where: {
        createdAt: {
          [Op.gte]: twentyFourHoursAgo,
        },
      },
      include: [
        {
          model: User,
          as: 'autor',
          attributes: ['nombre', 'apellido'],
        },
        {
          model: Area,
          as: 'area',
          attributes: ['id'],
        },
      ],
    })

    // Para cada post, encontrar usuarios en la misma área
    for (const post of recentPosts) {
      if (!post.area) continue // Saltar si el post no tiene área asignada

      const usersInSameArea = await User.findAll({
        where: {
          areaId: post.area.id,
        },
        attributes: ['email', 'nombre', 'apellido'],
      })

      // Enviar notificación a cada usuario
      for (const user of usersInSameArea) {
        await sendNewPostNotification(
          user.email,
          `${user.nombre} ${user.apellido}`,
          {
            titulo: post.titulo,
            contenido: post.contenido,
            autor: `${post.autor.nombre} ${post.autor.apellido}`,
          }
        )
      }
    }

    return true
  } catch (error) {
    console.error('Error al procesar notificaciones de nuevos posts:', error)
    throw error
  }
}

// Función para enviar correo de recuperación de contraseña
const sendPasswordResetEmail = async (to, resetUrl) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperación de Contraseña - Zucarlink</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding: 20px 0; text-align: center; background-color: #ffffff;">
            <img src="https://sawa-dev-2-storage-bucket.storage.googleapis.com/profiles/xhcujhfcadwkupzz-88efb.png"
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
                <h2 style="color: #e5533f; text-align: center; margin-bottom: 30px; font-size: 24px;">
                  Recuperación de Contraseña
                </h2>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                  <p style="color: #4A5568; font-size: 16px; line-height: 1.6;">
                    Has solicitado recuperar tu contraseña. Haz clic en el siguiente botón para restablecerla:
                  </p>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}"
                       style="background-color: #e5533f; color: white; padding: 12px 24px;
                              text-decoration: none; border-radius: 5px; font-weight: bold;
                              display: inline-block;">
                      Restablecer Contraseña
                    </a>
                  </div>

                  <p style="color: #4A5568; font-size: 14px; line-height: 1.6;">
                    Este enlace expirará en 1 hora.
                  </p>
                  <p style="color: #4A5568; font-size: 14px; line-height: 1.6;">
                    Si no solicitaste este cambio, por favor ignora este correo.
                  </p>
                </div>
              </div>

              <div style="background-color: #e5533f; padding: 20px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
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
    subject: 'Recuperación de Contraseña - Zucarlink',
    html: htmlTemplate,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Correo de recuperación enviado exitosamente')
    return true
  } catch (error) {
    console.error('Error al enviar correo de recuperación:', error)
    throw error
  }
}

module.exports = {
  sendReminderEmail,
  checkUnreadMessagesAndSendReminders,
  sendWelcomeEmail,
  sendNewPostNotification,
  checkNewPostsAndSendNotifications,
  sendPasswordResetEmail,
}
