import { Router } from 'express';
import { authenticateJWT } from '../passport';
import accountRouter from './account';
import postRouter from './post';

const router = Router();

router.use('/account', accountRouter);
router.use('/board', postRouter);

export default router;
