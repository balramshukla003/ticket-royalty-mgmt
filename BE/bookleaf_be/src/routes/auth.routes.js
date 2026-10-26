import { Router }      from 'express';
import authController  from '../controllers/auth.controller.js';
import authenticate    from '../middlewares/authenticate.js';
import validate        from '../middlewares/validate.js';
import { loginSchema } from '../dtos/request/auth.dto.js';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me',     authenticate,          authController.me);

export default router;
