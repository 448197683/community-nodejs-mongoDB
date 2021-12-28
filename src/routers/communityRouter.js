import express from 'express';
import {
  communityController,
  getWriteAritcleController,
  postWriteAritcleController,
  getArticleController,
} from '../controllers/communityController';

import { loginOnly, logoutOnly } from '../middleware/middleware.js';

export const communityRouter = express.Router();

communityRouter.get('/community', communityController);
communityRouter.get('/writeArticle', loginOnly, getWriteAritcleController);
communityRouter.post('/writeArticle', loginOnly, postWriteAritcleController);
communityRouter.get('/article/:id', getArticleController);
