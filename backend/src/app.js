const path = require('path')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const userRoutes = require('./routes/userRoutes')
const sequelize = require('./config/database')
const User = require('./models/User')
const fs = require('fs')

// Configuración
dotenv.config()
const app = express()
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(cors())
app.use(express.json())

sequelize
  .sync({ alter: true }) // Cambia la estructura sin borrar datos (Eliminar esto al estar en produccion)
  .then(() => {
    console.log('Base de datos sincronizada.')
  })
  .catch((error) => {
    console.error('Error al sincronizar la base de datos:', error)
  })

// Rutas
app.use('/api/users', userRoutes)

app.get('/', (req, res) => {
  res.send('API de usuarios')
})

const uploadDir = path.join(__dirname, 'uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

// Puerto de Inicio
const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})
