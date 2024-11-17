// src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();
const userController = new UserController();

// Admin only routes
router.post('/', 
  authMiddleware([Role.ADMIN]), 
  upload.single('profileImage'), 
  userController.createPerson
);

router.put('/:id', 
  authMiddleware([Role.ADMIN]), 
  upload.single('profileImage'), 
  userController.updatePerson
);

router.patch('/:id', 
  authMiddleware([Role.ADMIN]), 
  userController.disablePerson
);

// Admin and Security routes
router.get('/', 
  authMiddleware([Role.ADMIN, Role.SECURITY]), 
  userController.getAllPersons
);

router.get('/type/:type', 
  authMiddleware([Role.ADMIN, Role.SECURITY]), 
  userController.getPersonsByType
);

router.get('/:id', 
  authMiddleware([Role.ADMIN, Role.SECURITY]), 
  userController.getPersonById
);

export default router;