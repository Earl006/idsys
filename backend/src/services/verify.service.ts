import { PrismaClient, LogType, PersonType } from '@prisma/client';

const prisma = new PrismaClient();

export class VerifyService {
  async verifyPerson(personId: string, locationId: string) {
    try {
      const person = await prisma.person.findUnique({
        where: { id: personId },
        include: { 
          user: true,
          accessLogs: {
            where: { locationId }, // Check logs for this specific location
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        }
      });

      if (!person) {
        await this.logBreach(locationId);
        throw new Error('Invalid ID');
      }

      if (person.user.disabled) {
        throw new Error('Access denied: Account disabled');
      }

      // Get global last log to determine if person is in any location
      const globalLastLog = await prisma.accessLog.findFirst({
        where: { personId: person.id },
        orderBy: { timestamp: 'desc' }
      });

      const locationLastLog = person.accessLogs[0];
      const isCheckingIn = !locationLastLog || locationLastLog.type === LogType.CHECKOUT;

      // Prevent checking in if already checked in somewhere else
      if (isCheckingIn && globalLastLog?.type === LogType.CHECKIN) {
        throw new Error('Already checked in at another location');
      }

      const log = await prisma.accessLog.create({
        data: {
          personId: person.id,
          locationId: locationId,
          type: isCheckingIn ? LogType.CHECKIN : LogType.CHECKOUT
        }
      });

      return {
        person,
        log,
        action: isCheckingIn ? 'CHECKIN' : 'CHECKOUT'
      };
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  }

  async verifyPersonAtSecurityLocation(personId: string, securityId: string) {
    // Get security's assigned location
    const location = await prisma.location.findFirst({
      where: { securityId }
    });

    if (!location) {
      throw new Error('Security not assigned to any location');
    }

    return this.verifyPerson(personId, location.id);
  }

  private async logBreach(locationId: string) {
    try {
    return await prisma.accessLog.create({
      data: {
        locationId: locationId,
        type: LogType.BREACH
      }
    });
    } catch (error) {
      console.error('Failed to log breach:', error);
      throw new Error('Failed to record security breach');
    }
  }
}