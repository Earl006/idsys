// src/routes/verify.routes.ts
import { Router } from 'express';
import { VerifyController } from '../controllers/verify.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const verifyController = new VerifyController();

router.post(
  '/scan',
  authMiddleware([Role.SECURITY]),
  verifyController.verifyPerson
);

export default router;