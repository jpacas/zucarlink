const multer = require('multer')

// Configuración de almacenamiento en memoria
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'video/mp4',
    'video/mpeg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        'Tipo de archivo no permitido. Solo se aceptan imágenes, videos y documentos.'
      )
    )
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Máximo 10 MB
})

module.exports = upload
