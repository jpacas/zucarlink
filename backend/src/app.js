const path = require('path')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
const maquinariaRoutes = require('./routes/maquinariaRoutes')
const empleoRoutes = require('./routes/empleoRoutes')
const contactRoutes = require('./routes/contactRoutes')
const zucariaRoutes = require('./routes/zucariaRoutes')
const sequelize = require('./config/database')
const User = require('./models/User')
const fs = require('fs')

// Configuración General
dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

//Inicio de base de datos
sequelize
  .sync({ alter: false }) // Cambia la estructura sin borrar datos (Eliminar esto al estar en produccion)
  .then(() => {
    console.log('Base de datos sincronizada.')
  })
  .catch((error) => {
    console.error('Error al sincronizar la base de datos:', error)
  })

// Rutas
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/maquinaria', maquinariaRoutes)
app.use('/api/empleos', empleoRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/conversations', zucariaRoutes)

app.get('/', (req, res) => {
  res.send('API de usuarios')
})

// Puerto de Inicio
const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})
