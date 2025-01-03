const User = require('../models/User')

// Actualizar la foto de perfil
const uploadProfilePicture = async (req, res) => {
  const { id } = req.params

  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo' })
  }

  const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${
    req.file.filename
  }`

  try {
    const usuario = await User.findByPk(id)
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    usuario.avatarUrl = avatarUrl
    await usuario.save()

    res.status(200).json({ message: 'Foto de perfil actualizada', avatarUrl })
  } catch (error) {
    res.status(500).json({ message: 'Error al subir la foto de perfil', error })
  }
}

module.exports = { uploadProfilePicture }
