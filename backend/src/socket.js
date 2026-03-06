const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const { Message, Conversation, User } = require('./models')
const { Op } = require('sequelize')

// Almacenamiento en memoria para usuarios conectados
const connectedUsers = new Map()

async function getUnreadMessages(userId) {
  try {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
        isActive: true,
      },
      include: [
        {
          model: Message,
          as: 'messages',
          where: {
            senderId: { [Op.ne]: userId },
            isRead: false,
          },
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'nombre', 'apellido'],
            },
          ],
        },
      ],
    })

    return conversations.map((conv) => ({
      conversationId: conv.id,
      messages: conv.messages.map((msg) => ({
        id: msg.id,
        from: msg.senderId,
        to: userId,
        content: msg.content,
        timestamp: msg.createdAt,
        fromUserName: `${msg.sender.nombre} ${msg.sender.apellido}`,
      })),
    }))
  } catch (error) {
    console.error('Error al obtener mensajes no leídos:', error)
    return []
  }
}

async function getOrCreateConversation(user1Id, user2Id) {
  let conversation = await Conversation.findOne({
    where: {
      [Op.or]: [
        { user1Id, user2Id },
        { user1Id: user2Id, user2Id: user1Id },
      ],
      isActive: true,
    },
  })

  if (!conversation) {
    conversation = await Conversation.create({
      user1Id,
      user2Id,
    })
  }

  return conversation
}

// Lista blanca de origenes permitidos (igual que en app.js)
const allowedOrigins = [
  'https://zucarlink.com',
  'https://www.zucarlink.com',
]

// Agregar localhost solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173')
  allowedOrigins.push('http://localhost:3000')
}

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Permitir requests sin origin en desarrollo
        if (!origin && process.env.NODE_ENV !== 'production') {
          return callback(null, true)
        }
        if (allowedOrigins.includes(origin)) {
          return callback(null, true)
        }
        return callback(new Error('No permitido por CORS'))
      },
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    allowEIO3: true,
    transports: ['websocket', 'polling'],
    path: '/socket.io/',
    serveClient: false,
    maxHttpBufferSize: 1e6,
    allowRequest: (req, callback) => {
      // Validar origen en allowRequest también
      const origin = req.headers.origin
      if (!origin && process.env.NODE_ENV !== 'production') {
        return callback(null, true)
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback('Origin no permitido', false)
    },
    cookie: {
      name: 'io',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  })

  // Middleware de autenticación con JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      const userName = socket.handshake.auth.userName

      if (!token) {
        return next(new Error('Token de autenticación requerido'))
      }

      // Verificar el JWT
      let decoded
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
      } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
          return next(new Error('Token expirado'))
        }
        return next(new Error('Token inválido'))
      }

      // Verificar que el usuario existe en la BD
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'nombre', 'apellido'],
      })

      if (!user) {
        return next(new Error('Usuario no encontrado'))
      }

      // Asignar datos del usuario al socket
      socket.userId = decoded.id
      socket.userName = userName || `${user.nombre} ${user.apellido}`

      const oldSocketId = connectedUsers.get(decoded.id)
      if (oldSocketId && oldSocketId !== socket.id) {
        connectedUsers.set(decoded.id, socket.id)
      }

      next()
    } catch (error) {
      console.error('Error en middleware de autenticación:', error)
      next(new Error('Error de autenticación'))
    }
  })

  io.on('connection', (socket) => {
    try {
      const userId = socket.userId

      connectedUsers.set(userId, socket.id)

      // Enviar mensajes no leídos al conectarse
      getUnreadMessages(userId).then((unreadConversations) => {
        if (unreadConversations.length > 0) {
          socket.emit('unread_messages', unreadConversations)
        }
      })

      socket.emit('connect_confirmed', { userId: socket.userId })

      socket.on('private_message', async ({ recipientId, content }) => {
        try {
          const conversation = await getOrCreateConversation(
            userId,
            recipientId
          )

          const message = await Message.create({
            conversationId: conversation.id,
            senderId: userId,
            recipientId: recipientId,
            content,
            isRead: false,
          })

          // Actualizar lastMessageAt de la conversación
          await conversation.update({
            lastMessageAt: new Date(),
          })

          const messageData = {
            id: message.id,
            from: userId,
            to: recipientId,
            content,
            timestamp: message.createdAt,
            fromUserName: socket.userName,
          }

          const recipientSocketId = connectedUsers.get(recipientId)
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('private_message', messageData)
          }

          socket.emit('message_sent', messageData)
        } catch (error) {
          console.error('Error al enviar mensaje privado:', error)
          socket.emit('message_error', { error: 'Error al enviar mensaje' })
        }
      })

      socket.on('get_message_history', async ({ otherUserId }) => {
        try {
          const conversation = await getOrCreateConversation(
            userId,
            otherUserId
          )

          const messages = await Message.findAll({
            where: { conversationId: conversation.id },
            order: [['createdAt', 'ASC']],
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['nombre', 'apellido'],
              },
            ],
          })

          const formattedMessages = messages.map((msg) => ({
            id: msg.id,
            from: msg.senderId,
            to: msg.recipientId,
            content: msg.content,
            timestamp: msg.createdAt,
            fromUserName: `${msg.sender.nombre} ${msg.sender.apellido}`,
          }))

          socket.emit('message_history', formattedMessages)

          // Marcar mensajes como leídos
          await Message.update(
            { isRead: true },
            {
              where: {
                conversationId: conversation.id,
                senderId: otherUserId,
                isRead: false,
              },
            }
          )
        } catch (error) {
          console.error('Error al obtener historial:', error)
          socket.emit('history_error', { error: 'Error al obtener historial' })
        }
      })

      socket.on('ping', () => {
        socket.emit('pong')
      })

      socket.on('disconnect', (reason) => {
        if (connectedUsers.get(userId) === socket.id) {
          connectedUsers.delete(userId)
        }
      })

      socket.on('error', (error) => {
        console.error('Error de Socket.IO:', error)
      })
    } catch (error) {
      console.error('Error en manejo de conexión:', error)
      socket.disconnect(true)
    }
  })

  io.engine.on('connection_error', (err) => {
    console.error('Error de conexión:', err)
  })

  return io
}

module.exports = { initializeSocket }
