import { Router }     from 'express';
import bookController from '../controllers/book.controller.js';
import authenticate   from '../middlewares/authenticate.js';
import authorize      from '../middlewares/authorize.js';
import { ROLES }      from '../constants/index.js';

const router = Router();

router.use(authenticate, authorize(ROLES.AUTHOR));

router.get('/',           bookController.getMyBooks);
router.get('/dropdown',   bookController.getDropdown);
router.get('/:id',        bookController.getMyBookById);

export default router;
