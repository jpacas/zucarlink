const ZucarIA = require('../models/ZucarIA')
const axios = require('axios')

exports.chat = async (req, res) => {
  const { messages } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({
      error: 'messages es obligatorio y debe ser un array.',
    })
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'ft:gpt-3.5-turbo-0125:personal::Axk617ow',
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    res.status(200).json(response.data)
  } catch (error) {
    console.error('Error al llamar a OpenAI:', error)
    res.status(500).json({ error: 'Error al obtener respuesta de ZucarIA.' })
  }
}

exports.saveConversation = async (req, res) => {
  const { messages } = req.body
  const usuarioId = req.user?.id

  if (!usuarioId || !messages || !Array.isArray(messages)) {
    return res.status(400).json({
      error: 'usuarioId y messages son obligatorios y deben ser válidos.',
    })
  }

  try {
    // Guardar conversación
    const conversation = await ZucarIA.create({ usuarioId, messages })
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
  const usuarioId = req.user?.id

  try {
    if (String(userId) !== String(usuarioId)) {
      return res.status(403).json({
        error: 'No tienes permiso para ver estas conversaciones.',
      })
    }
    const conversations = await ZucarIA.findAll({
      where: { usuarioId: userId },
      order: [['createdAt', 'DESC']],
    })

    res.status(200).json(conversations)
  } catch (error) {
    console.error('Error al obtener conversaciones:', error)
    res.status(500).json({ error: 'Error al obtener las conversaciones.' })
  }
}
