import express from 'express';
import {
  communityController,
  getWriteAritcleController,
  postWriteAritcleController,
  getArticleController,
  deleteArticlecontroller,
  putArticleCOntroller,
  getEditArticleController,
  putAddGoodController,
  addCommentController,
  deleteCommentController,
  putCommentController,
  postnestCommentController,
  deleteNestCommentController,
  searchController,
} from '../controllers/communityController';

import { loginOnly, logoutOnly } from '../middleware/middleware.js';

export const communityRouter = express.Router();

communityRouter.get('/community/:page', communityController);
communityRouter.get('/search', searchController);
communityRouter.get('/writeArticle', loginOnly, getWriteAritcleController);
communityRouter.post('/writeArticle', loginOnly, postWriteAritcleController);
communityRouter.get('/article/:id', getArticleController);
communityRouter.delete('/article/:id', loginOnly, deleteArticlecontroller);
communityRouter.put('/article/:id', loginOnly, putArticleCOntroller);
communityRouter.get('/editArticle/:id', getEditArticleController);
communityRouter.put('/addGood/:id', loginOnly, putAddGoodController);
communityRouter.post('/comments/:articleID', loginOnly, addCommentController);
communityRouter.delete(
  '/comments/:articleID',
  loginOnly,
  deleteCommentController
);
communityRouter.put('/comments/:commentID', loginOnly, putCommentController);
communityRouter.post(
  '/nestComments/:commentID',
  loginOnly,
  postnestCommentController
);
communityRouter.delete(
  '/nestComments/:articleID',
  loginOnly,
  deleteNestCommentController
);
