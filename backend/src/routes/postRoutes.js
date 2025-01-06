const express = require('express')
const {
  getAllPosts,
  createPost,
  getPostsByCategory,
} = require('../controllers/postController')
const router = express.Router()

router.get('/', getAllPosts)
router.post('/', createPost)
router.get('/categoria', getPostsByCategory)

module.exports = router
