// src/routes/location.routes.ts
import { Router } from 'express';
import { LocationController } from '../controllers/location.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const locationController = new LocationController();

// Admin routes
router.post(
  '/',
  authMiddleware([Role.ADMIN]),
  locationController.createLocation
);

router.post(
  '/assign',
  authMiddleware([Role.ADMIN]),
  locationController.assignSecurity
);

router.delete(
  '/:id/security',
  authMiddleware([Role.ADMIN]),
  locationController.unassignSecurity
);

// Admin and Security routes
router.get(
  '/',
  authMiddleware([Role.ADMIN, Role.SECURITY]),
  locationController.getAllLocations
);

router.get(
  '/:id/logs',
  authMiddleware([Role.ADMIN, Role.SECURITY]),
  locationController.getLocationLogs
);

router.get(
  '/breaches',
  authMiddleware([Role.ADMIN, Role.SECURITY]),
  locationController.getBreachLogs
);

export default router;