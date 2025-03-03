const express = require('express')
const {
  getAllPosts,
  createPost,
  toggleLike,
  addComment,
  incrementViews,
  deleteComment,
  getPostById,
  deletePost,
  updatePost,
} = require('../controllers/postController')
const router = express.Router()
const upload = require('../middleware/multer')

router.get('/', getAllPosts)
router.post('/', upload.array('archivos', 5), createPost)
router.post('/:postId/like', toggleLike)
router.post('/:postId/comment', addComment)
router.post('/:postId/view', incrementViews)
router.delete('/:postId/comment/:commentId', deleteComment)
router.get('/:postId', getPostById)
router.delete('/:id', deletePost)
router.put('/:id', upload.array('archivos', 5), updatePost)

module.exports = router
