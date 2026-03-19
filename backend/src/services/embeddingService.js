const axios = require('axios')
const PostEmbedding = require('../models/PostEmbedding')
const Post = require('../models/Post')

const EMBEDDING_MODEL = 'text-embedding-3-small'
const MAX_CONTENT_LENGTH = 2000 // chars to index per post

// Compute cosine similarity between two vectors
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Get embedding from OpenAI for a piece of text
async function getEmbedding(text) {
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    { model: EMBEDDING_MODEL, input: text.substring(0, MAX_CONTENT_LENGTH) },
    { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' } }
  )
  return response.data.data[0].embedding
}

// Index a single post
async function indexPost(post) {
  try {
    const contenido = `${post.titulo}\n\n${post.contenido}`.substring(0, MAX_CONTENT_LENGTH)
    const embedding = await getEmbedding(contenido)

    await PostEmbedding.upsert({ postId: post.id, contenido, embeddingVector: embedding })
    return true
  } catch (error) {
    console.error(`Error indexing post ${post.id}:`, error.message)
    return false
  }
}

// Index all posts that don't have embeddings yet
async function indexAllPosts() {
  const posts = await Post.findAll({ attributes: ['id', 'titulo', 'contenido'] })
  let indexed = 0

  for (const post of posts) {
    const exists = await PostEmbedding.findOne({ where: { postId: post.id } })
    if (!exists) {
      const success = await indexPost(post)
      if (success) indexed++
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200))
    }
  }

  return indexed
}

// Find the top N most similar posts for a query
async function findRelevantPosts(query, topN = 5) {
  try {
    const queryEmbedding = await getEmbedding(query)
    const allEmbeddings = await PostEmbedding.findAll({
      attributes: ['postId', 'contenido', 'embeddingVector'],
    })

    if (allEmbeddings.length === 0) return []

    const scored = allEmbeddings.map(e => ({
      postId: e.postId,
      contenido: e.contenido,
      score: cosineSimilarity(queryEmbedding, e.embeddingVector),
    }))

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .filter(r => r.score > 0.3) // minimum relevance threshold
  } catch (error) {
    console.error('Error finding relevant posts:', error.message)
    return []
  }
}

module.exports = { getEmbedding, indexPost, indexAllPosts, findRelevantPosts }
