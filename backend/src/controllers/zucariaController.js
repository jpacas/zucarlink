const ZucarIA = require('../models/ZucarIA')

exports.saveConversation = async (req, res) => {
  const { userId, messages } = req.body

  if (!userId || !messages || !Array.isArray(messages)) {
    return res.status(400).json({
      error: 'userId y messages son obligatorios y deben ser válidos.',
    })
  }

  try {
    // Guardar conversación
    const conversation = await ZucarIA.create({ userId, messages })
    res
      .status(201)
      .json({ message: 'Conversación guardada con éxito.', conversation })
  } catch (error) {
    console.error('Error al guardar conversación:', error)
    res.status(500).json({ error: 'Error interno al guardar la conversación.' })
  }
}

exports.getUserConversations = async (req, res) => {
  const { userId } = req.params

  try {
    const conversations = await ZucarIA.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    })

    res.status(200).json(conversations)
  } catch (error) {
    console.error('Error al obtener conversaciones:', error)
    res.status(500).json({ error: 'Error al obtener las conversaciones.' })
  }
}
