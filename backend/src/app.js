const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
const maquinariaRoutes = require('./routes/maquinariaRoutes')
const empleoRoutes = require('./routes/empleoRoutes')
const contactRoutes = require('./routes/contactRoutes')
const zucariaRoutes = require('./routes/zucariaRoutes')
const experienciaRoutes = require('./routes/experienciaRoutes')
const helperRoutes = require('./routes/helperRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const sequelize = require('./config/database')
const setupAssociations = require('./models/associations')
const { initializeSocket } = require('./socket')
const authMiddleware = require('./middleware/authMiddleware')
const { scheduleReminderChecks } = require('./services/scheduler')
const { errorHandler, AppError } = require('./middleware/errorHandler')

// Configuración General
dotenv.config()
const app = express()
const server = http.createServer(app)

// Configuración del middleware para el body parser
app.use((req, res, next) => {
  if (req.originalUrl === '/payments/webhook') {
    next()
  } else {
    express.json()(req, res, next)
  }
})

// Lista blanca de origenes permitidos (sin regex para mayor seguridad)
const allowedOrigins = [
  'https://zucarlink.com',
  'https://www.zucarlink.com',
]

// Agregar localhost solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173')
  allowedOrigins.push('http://localhost:3000')
}

// Configuración de CORS con lista blanca explícita
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (como mobile apps o Postman en desarrollo)
      if (!origin && process.env.NODE_ENV !== 'production') {
        return callback(null, true)
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error('No permitido por CORS'))
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Configuración para recibir datos de formularios
app.use(express.urlencoded({ extended: true }))

// Inicializar Socket.io
const io = initializeSocket(server)

// Middleware para hacer io accesible en las rutas
app.use((req, res, next) => {
  req.io = io
  next()
})

//Inicializando la base de datos y las asociaciones
const initializeDatabase = async () => {
  try {
    // Primero autenticamos la conexión
    await sequelize.authenticate()
    console.log('Conexión a la base de datos exitosa')

    // Configuramos las asociaciones
    setupAssociations()
    console.log('Asociaciones configuradas exitosamente')

    // Realizamos la sincronización en desarrollo solo si se solicita
    if (process.env.SYNC_DB === 'true') {
      await sequelize.sync({ alter: true })
      console.log('Base de datos sincronizada exitosamente')
    }
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error)
    process.exit(1) // Terminar el proceso si hay un error crítico
  }
}

// Inicializar la base de datos
initializeDatabase()

// Inicializar el programador de recordatorios
scheduleReminderChecks()

// Rutas
app.use('/users', userRoutes)
app.use('/posts', authMiddleware, postRoutes)
app.use('/maquinaria', maquinariaRoutes)
app.use('/empleos', empleoRoutes)
app.use('/contact', contactRoutes)
app.use('/conversations', authMiddleware, zucariaRoutes)
app.use('/experiencias', authMiddleware, experienciaRoutes)
app.use('/helper', helperRoutes)
app.use('/payments', paymentRoutes)

app.get('/', (req, res) => {
  res.send('API de Zucarlink')
})

// Manejo de rutas no encontradas
app.all('*', (req, res, next) => {
  next(new AppError(`No se encontró ${req.originalUrl} en este servidor`, 404))
})

// Middleware de manejo global de errores
app.use(errorHandler)

// Puerto de Inicio
const PORT = process.env.PORT || 5001
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})
