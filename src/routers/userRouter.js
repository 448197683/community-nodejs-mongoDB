import express from 'express';
export const userRouter = express.Router();
import {
  multerUpload,
  loginOnly,
  logoutOnly,
} from '../middleware/middleware.js';
import {
  getJoinController,
  postJoinController,
  getLoginController,
  postLoginController,
  getLogoutController,
  gihubStartController,
  githubFinishController,
  googleStartController,
  googleFinishController,
  getProfileController,
  getEditProfileController,
  postEditProfileController,
} from '../controllers/userController.js';

const avatarUpload = multerUpload.single('avatar');

userRouter.get('/join', logoutOnly, getJoinController);
userRouter.post('/join', logoutOnly, avatarUpload, postJoinController);
userRouter.get('/login', logoutOnly, getLoginController);
userRouter.post('/login', logoutOnly, postLoginController);
userRouter.get('/logout', loginOnly, getLogoutController);
userRouter.get('/github/start', gihubStartController);
userRouter.get('/github/callback', githubFinishController);
userRouter.get('/google/start', googleStartController);
userRouter.get('/google/callback', googleFinishController);
userRouter.get('/profile', getProfileController);
userRouter
  .route('/editProfile')
  .get(loginOnly, getEditProfileController)
  .post(loginOnly, avatarUpload, postEditProfileController);
