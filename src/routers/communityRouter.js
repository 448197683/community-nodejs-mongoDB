import express from 'express';
import {
  communityController,
  getAritcleController,
  postAritcleController,
} from '../controllers/communityController';

export const communityRouter = express.Router();

communityRouter.get('/community', communityController);
communityRouter.get('/article', getAritcleController);
communityRouter.post('/article', postAritcleController);
