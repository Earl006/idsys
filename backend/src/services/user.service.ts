// src/services/userService.ts
import { PrismaClient, PersonType, Role, User, Person } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { QRCodeGenerator } from '../bg-services/qrgenerator.service';
import { CloudinaryService } from '../bg-services/cloudinary.service';
import { IdGenerationService } from '../bg-services/idgenerator.service';

const prisma = new PrismaClient();

interface CreatePersonDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  type: PersonType;
  profileImage?: Express.Multer.File;
}

interface UpdatePersonDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: Express.Multer.File;
}

export class UserService {
  private qrGenerator: QRCodeGenerator;
  private cloudinary: CloudinaryService;
  private idGenerator: IdGenerationService;

  constructor() {
    this.qrGenerator = new QRCodeGenerator();
    this.cloudinary = new CloudinaryService();
    this.idGenerator = new IdGenerationService();
  }

  async createPerson(data: CreatePersonDto): Promise<User & { person: Person }> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    let profileImageUrl;
    if (data.profileImage) {
      profileImageUrl = await this.cloudinary.uploadImage(data.profileImage);
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: Role.USER,
        person: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            type: data.type,
            profileImage: profileImageUrl,
            qrCode: await this.qrGenerator.generate(data.email)
          }
        }
      },
      include: { person: true }
    });

    await this.generateIdCard(user.person!.id);
    
    return user as User & { person: Person };
  }

  async getAllPersons() {
    return await prisma.person.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true,
            createdAt: true
          }
        }
      }
    });
  }

  async getPersonById(id: string) {
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            createdAt: true
          }
        }
      }
    });

    if (!person) throw new Error('Person not found');
    return person;
  }

  async getPersonsByType(type: PersonType) {
    return await prisma.person.findMany({
      where: { type },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            createdAt: true
          }
        }
      }
    });
  }

  async updatePerson(id: string, data: UpdatePersonDto) {
    await this.validatePersonExists(id);

    let updateData: any = { ...data };
    
    if (data.profileImage) {
      updateData.profileImage = await this.cloudinary.uploadImage(data.profileImage);
    }

    if (data.email) {
      await prisma.user.update({
        where: { id: (await this.getPersonById(id)).userId },
        data: { email: data.email }
      });
    }

    return await prisma.person.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            role: true,
            createdAt: true
          }
        }
      }
    });
  }

  async disablePerson(id: string) {
    await this.validatePersonExists(id);
    
    const person = await this.getPersonById(id);
    
    return await prisma.user.update({
      where: { id: person.userId },
      data: { disabled: true }
    });
  }

  private async generateIdCard(personId: string) {
    try {
      const idPath = await this.idGenerator.generateId(personId);
      await prisma.person.update({
        where: { id: personId },
        data: { idCardImage: idPath }
      });
    } catch (error) {
      console.error('Failed to generate ID card:', error);
      throw new Error('Failed to generate ID card');
    }
  }

  private async validatePersonExists(id: string) {
    const person = await prisma.person.findUnique({ where: { id } });
    if (!person) throw new Error('Person not found');
  }
}