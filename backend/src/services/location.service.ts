// src/services/location.service.ts
import { PrismaClient, GateType, LogType } from '@prisma/client';

const prisma = new PrismaClient();

export class LocationService {
  async createLocation(data: { name: string; type: GateType }) {
    return await prisma.location.create({
      data
    });
  }

  async getAllLocations() {
    return await prisma.location.findMany({
      include: {
        accessLogs: {
          take: 5,
          orderBy: { timestamp: 'desc' }
        }
      }
    });
  }

  async getLocationLogs(locationId: string, date?: Date) {
    const whereClause = date ? {
      AND: [
        { locationId },
        {
          timestamp: {
            gte: new Date(date.setHours(0,0,0,0)),
            lte: new Date(date.setHours(23,59,59,999))
          }
        }
      ]
    } : { locationId };

    return await prisma.accessLog.findMany({
      where: whereClause,
      include: {
        person: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
  }

  async getBreachLogs() {
    return await prisma.accessLog.findMany({
      where: { type: LogType.BREACH },
      include: {
        location: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
  }

  async assignSecurity(locationId: string, securityId: string) {
    // Verify security role
    const security = await prisma.user.findUnique({
      where: { id: securityId }
    });

    if (!security || security.role !== 'SECURITY') {
      throw new Error('Invalid security personnel');
    }

    // Check if security is already assigned elsewhere
    const existingAssignment = await prisma.location.findFirst({
      where: { securityId }
    });

    if (existingAssignment) {
      throw new Error('Security already assigned to another location');
    }

    return await prisma.location.update({
      where: { id: locationId },
      data: { securityId },
      include: { security: true }
    });
  }

  async unassignSecurity(locationId: string) {
    return await prisma.location.update({
      where: { id: locationId },
      data: { securityId: null }
    });
  }

  async getSecurityLocation(securityId: string) {
    return await prisma.location.findFirst({
      where: { securityId }
    });
  }
}