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

// Configuración General
dotenv.config()
const app = express()
const server = http.createServer(app)

// Configuración de CORS
app.use(
  cors({
    origin: [
      'https://zucarlink.com',
      'http://zucarlink.com',
      'http://localhost:5173',
      /\.zucarlink\.com$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'my-custom-header'],
  })
)

// Middleware para parsear JSON
app.use(express.json())

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

    // Realizamos la sincronización
    //await sequelize.sync({ force: true })
    //console.log('Base de datos sincronizada exitosamente')
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error)
    process.exit(1) // Terminar el proceso si hay un error crítico
  }
}

// Inicializar la base de datos
initializeDatabase()

// Inicializar el programador de recordatorios
//scheduleReminderChecks()

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

// Puerto de Inicio
const PORT = process.env.PORT || 5001
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})
