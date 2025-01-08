const express = require('express')
const {
  getAllPosts,
  createPost,
  toggleLike,
  addComment,
  incrementViews,
} = require('../controllers/postController')
const router = express.Router()

router.get('/', getAllPosts)
router.post('/', createPost)
router.post('/:postId/like', toggleLike)
router.post('/:postId/comment', addComment)
router.post('/:postId/view', incrementViews)

module.exports = router
