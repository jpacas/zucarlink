const ZucarIA = require('../models/ZucarIA')
const axios = require('axios')
const { findRelevantPosts } = require('../services/embeddingService')

const MAX_CONTEXT_MESSAGES = 20

exports.chat = async (req, res) => {
  const { messages } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({
      error: 'messages es obligatorio y debe ser un array.',
    })
  }

  // Get the last user message for RAG
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()
  let ragContext = ''

  if (lastUserMessage) {
    const relevantPosts = await findRelevantPosts(lastUserMessage.content, 5)
    if (relevantPosts.length > 0) {
      ragContext = '\n\nInformación relevante de la comunidad Zucarlink:\n' +
        relevantPosts.map((p, i) => `[${i + 1}] ${p.contenido.substring(0, 500)}`).join('\n\n')
    }
  }

  // Apply sliding window context limiting to avoid token limit errors.
  // Keep the system message (always first) and at most the last MAX_CONTEXT_MESSAGES
  // user/assistant messages.
  let windowedMessages
  if (messages.length > 0 && messages[0].role === 'system') {
    const systemMessage = ragContext
      ? { ...messages[0], content: messages[0].content + ragContext }
      : messages[0]
    const rest = messages.slice(1)
    const limited = rest.slice(-MAX_CONTEXT_MESSAGES)
    windowedMessages = [systemMessage, ...limited]
  } else {
    windowedMessages = messages.slice(-MAX_CONTEXT_MESSAGES)
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'ft:gpt-3.5-turbo-0125:personal::Axk617ow',
        messages: windowedMessages,
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
