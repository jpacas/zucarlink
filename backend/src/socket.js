const { Server } = require('socket.io')

// Almacenamiento en memoria para los mensajes y usuarios conectados
const connectedUsers = new Map()
const messageHistory = new Map()

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        'https://zucarlink.com',
        'http://zucarlink.com',
        'http://localhost:5173',
        /\.zucarlink\.com$/,
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    allowEIO3: true,
    transports: ['websocket', 'polling'],
    path: '/socket.io/',
    serveClient: false,
    maxHttpBufferSize: 1e6,
    allowRequest: (req, callback) => {
      callback(null, true)
    },
    cookie: {
      name: 'io',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  })

  // Middleware de autenticación
  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.auth.userId
      const userName = socket.handshake.auth.userName
      if (!userId) {
        return next(new Error('Usuario no autenticado'))
      }

      // Guardar el ID y nombre del usuario en el socket
      socket.userId = userId
      socket.userName = userName

      // Si hay una conexión existente, solo actualizar el socket ID
      const oldSocketId = connectedUsers.get(userId)
      if (oldSocketId && oldSocketId !== socket.id) {
        console.log(
          `Usuario ${userId} tiene una conexión existente, actualizando socket ID`
        )
        connectedUsers.set(userId, socket.id)
      }

      next()
    } catch (error) {
      console.error('Error en middleware de autenticación:', error)
      next(new Error('Error de autenticación'))
    }
  })

  // Manejo de conexiones
  io.on('connection', (socket) => {
    try {
      const userId = socket.userId

      // Registrar la nueva conexión
      connectedUsers.set(userId, socket.id)

      // Inicializar el historial de mensajes para el usuario si no existe
      if (!messageHistory.has(userId)) {
        messageHistory.set(userId, [])
      }

      // Informar al cliente que la conexión fue exitosa
      socket.emit('connect_confirmed', { userId: socket.userId })

      // Manejar mensajes privados
      socket.on('private_message', ({ recipientId, content }) => {
        try {
          const recipientSocketId = connectedUsers.get(recipientId)

          const messageData = {
            from: userId,
            to: recipientId,
            content,
            timestamp: new Date(),
            fromUserName: socket.userName,
          }

          // Guardar mensaje en el historial
          const senderHistory = messageHistory.get(userId) || []
          const recipientHistory = messageHistory.get(recipientId) || []
          senderHistory.push(messageData)
          recipientHistory.push(messageData)
          messageHistory.set(userId, senderHistory)
          messageHistory.set(recipientId, recipientHistory)

          // Enviar mensaje al destinatario si está conectado
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('private_message', messageData)
          }

          // Confirmar envío al remitente
          socket.emit('message_sent', messageData)
        } catch (error) {
          console.error('Error al enviar mensaje privado:', error)
          socket.emit('message_error', { error: 'Error al enviar mensaje' })
        }
      })

      // Obtener historial de mensajes
      socket.on('get_message_history', ({ otherUserId }) => {
        try {
          const userHistory = messageHistory.get(userId) || []
          const relevantMessages = userHistory.filter(
            (msg) => msg.from === otherUserId || msg.to === otherUserId
          )
          socket.emit('message_history', relevantMessages)
        } catch (error) {
          console.error('Error al obtener historial:', error)
          socket.emit('history_error', { error: 'Error al obtener historial' })
        }
      })

      // Manejar ping
      socket.on('ping', () => {
        socket.emit('pong')
      })

      // Manejar desconexión
      socket.on('disconnect', (reason) => {
        if (connectedUsers.get(userId) === socket.id) {
          connectedUsers.delete(userId)
        }
      })

      // Manejar errores
      socket.on('error', (error) => {
        console.error('Error de Socket.IO:', error)
      })
    } catch (error) {
      console.error('Error en manejo de conexión:', error)
      socket.disconnect(true)
    }
  })

  // Manejar errores del servidor
  io.engine.on('connection_error', (err) => {
    console.error('Error de conexión:', err)
  })

  return io
}

module.exports = { initializeSocket }
