const express = require('express')
const {
  getAllPosts,
  createPost,
  toggleLike,
  addComment,
  incrementViewsHandler,
  deleteComment,
  getPostById,
  deletePost,
  updatePost,
  votePost,
  unvotePost,
} = require('../controllers/postController')
const router = express.Router()
const upload = require('../middleware/multer')
const authMiddleware = require('../middleware/authMiddleware')
const {
  createPostValidators,
  updatePostValidators,
  createCommentValidators,
  listPostsValidators,
} = require('../middleware/validators/postValidators')

router.get('/', listPostsValidators, getAllPosts)
router.post('/', authMiddleware, upload.array('archivos', 5), createPostValidators, createPost)
router.post('/:postId/like', authMiddleware, toggleLike)
router.post('/:postId/vote', authMiddleware, votePost)
router.delete('/:postId/vote', authMiddleware, unvotePost)
router.post('/:postId/comment', authMiddleware, createCommentValidators, addComment)
router.post('/:postId/view', incrementViewsHandler)
router.delete('/:postId/comment/:commentId', authMiddleware, deleteComment)
router.get('/:postId', getPostById)
router.delete('/:id', authMiddleware, deletePost)
router.put('/:id', authMiddleware, upload.array('archivos', 5), updatePostValidators, updatePost)

module.exports = router
