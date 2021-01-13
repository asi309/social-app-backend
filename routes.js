const express = require('express');

const verifyToken = require('./config/verifyToken');
const followController = require('./controllers/followController');
const homeController = require('./controllers/homeController');
const authController = require('./controllers/authController');
const postController = require('./controllers/postController');
const reactionController = require('./controllers/reactionController');
const userController = require('./controllers/userController');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'server is running',
  });
});

// auth routes
router.post('/login', authController.login);
router.get('/logout', verifyToken, authController.logout);
router.post('/user/register', userController.createUser);
router.get('/check', verifyToken, authController.checkAuthStatus);

//social routes
router.get('/user/:userId', verifyToken, userController.getUserById);
router.post('/user/follow', verifyToken, followController.follow);
router.get('/post/like', verifyToken, reactionController.likePost);
router.post('/post/comment', verifyToken, reactionController.createComment);
router.get('/post/:postId', verifyToken, postController.getPostById);

// home route for all the posts -> GET
router.get('/home', verifyToken, homeController.showAllPosts);
// get route for all my posts -> GET
router.get('/posts', verifyToken, postController.getPostByUser);

// post route for adding new post -> POST
router.post('/create', verifyToken, postController.createPost);

module.exports = router;
