const multer = require('multer')
const path = require('path')

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads')) // Carpeta donde se almacenarán los archivos subidos
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) // Extensión del archivo
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, uniqueName) // Nombre único para evitar conflictos
  },
})

// Filtro de archivos (opcional, restringir a imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes.'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limitar el tamaño a 2 MB
})

module.exports = upload
