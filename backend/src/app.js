const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
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

// Configuración General
dotenv.config()
const app = express()
app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())

//Inicializando la base de datos y las asociaciones
sequelize
  .authenticate()
  //.sync({ alter: true })
  .then(() => {
    console.log('Conexión a la base de datos exitosa')
    setupAssociations() // Configurar las asociaciones después de conectar
    console.log('Asociaciones configuradas exitosamente')
  })
  .catch((err) => console.error('Error al conectar la base de datos:', err))

// Rutas
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/maquinaria', maquinariaRoutes)
app.use('/api/empleos', empleoRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/conversations', zucariaRoutes)
app.use('/api/experiencias', experienciaRoutes)
app.use('/api/helper', helperRoutes)
app.use('/api/payments', paymentRoutes)

app.get('/', (req, res) => {
  res.send('API de Zucarlink')
})

// Puerto de Inicio
const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})
