// src/services/userService.ts
import { PrismaClient, PersonType, Role, User, Person } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { QRCodeGenerator } from "../bg-services/qrgenerator.service";
import { uploadToCloudinary } from "../bg-services/cloudinary.service";
import { IdGenerationService } from "../bg-services/idgenerator.service";
import cuid from "cuid";

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
  private idGenerator: IdGenerationService;

  constructor() {
    this.qrGenerator = new QRCodeGenerator();
    this.idGenerator = new IdGenerationService();
  }

  private async validateEmail(email: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new Error("Email already exists");
    }
  }

  async createPerson(
    data: CreatePersonDto
  ): Promise<User & { person: Person }> {
    await this.validateEmail(data.email);
    const hashedPassword = await bcrypt.hash(data.password, 10);

    let profileImageUrl;
    if (data.profileImage) {
      profileImageUrl = await uploadToCloudinary(data.profileImage);
    }

    try {
      const userId = cuid();
      const user = await prisma.user.create({
        data: {
          id: userId,
          email: data.email,
          password: hashedPassword,
          role: Role.USER,
          person: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              type: data.type,
              profileImage: profileImageUrl,
              // QR code will be generated after person creation
              qrCode: "", // temporary placeholder
            },
          },
        },
        include: { person: true },
      });

      // Update person with QR code containing person.id
      const updatedPerson = await prisma.person.update({
        where: { id: user.person!.id },
        data: {
          qrCode: await this.qrGenerator.generate(user.person!.id),
        },
      });

      user.person = updatedPerson;
      await this.generateIdCard(user.person.id);

      return user as User & { person: Person };
    } catch (error) {
      if (profileImageUrl) {
        // Add cleanup logic here if needed
      }
      throw error;
    }
  }

  async getAllPersons() {
    return await prisma.person.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
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
            createdAt: true,
          },
        },
      },
    });

    if (!person) throw new Error("Person not found");
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
            createdAt: true,
          },
        },
      },
    });
  }

  async updatePerson(id: string, data: UpdatePersonDto) {
    await this.validatePersonExists(id);

    let updateData: any = { ...data };

    if (data.profileImage) {
      updateData.profileImage = await uploadToCloudinary(data.profileImage);
    }

    if (data.email) {
      await prisma.user.update({
        where: { id: (await this.getPersonById(id)).userId },
        data: { email: data.email },
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
            createdAt: true,
          },
        },
      },
    });
  }

  async disablePerson(id: string) {
    await this.validatePersonExists(id);

    const person = await this.getPersonById(id);

    return await prisma.user.update({
      where: { id: person.userId },
      data: { disabled: true },
    });
  }
  async createSecurityAcc(data: CreatePersonDto): Promise<User> {
    await this.validateEmail(data.email);
    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: Role.SECURITY,
          person: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              type: PersonType.STAFF,
              profileImage: data.profileImage
                ? await uploadToCloudinary(data.profileImage)
                : "https://static.vecteezy.com/system/resources/previews/005/545/335/non_2x/user-sign-icon-person-symbol-human-avatar-isolated-on-white-backogrund-vector.jpg",
              qrCode: "",
            },
          },
        },
        include: {
          person: true,
        },
      });

      // Update QR code after creation
      const updatedPerson = await prisma.person.update({
        where: { id: user.person!.id },
        data: {
          qrCode: await this.qrGenerator.generate(user.person!.id),
        },
      });

      user.person = updatedPerson;
      await this.generateIdCard(user.person.id);

      return user;
    } catch (error) {
      console.error("Security account creation error:", error);
      throw error;
    }
  }

  async createAdminAcc(
    data: CreatePersonDto
  ): Promise<User & { person: Person }> {
    await this.validateEmail(data.email);
    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: Role.ADMIN,
          person: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              type: PersonType.STAFF,
              profileImage: data.profileImage
                ? await uploadToCloudinary(data.profileImage)
                : "https://static.vecteezy.com/system/resources/previews/005/545/335/non_2x/user-sign-icon-person-symbol-human-avatar-isolated-on-white-backogrund-vector.jpg",
              qrCode: "",
            },
          },
        },
        include: { person: true },
      });

      // Update QR code after creation
      const updatedPerson = await prisma.person.update({
        where: { id: user.person!.id },
        data: {
          qrCode: await this.qrGenerator.generate(user.person!.id),
        },
      });

      user.person = updatedPerson;
      await this.generateIdCard(user.person.id);

      return user as User & { person: Person };
    } catch (error) {
      console.error("Admin account creation error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to create admin account: ${errorMessage}`);
    }
  }

  private async generateIdCard(personId: string) {
    try {
      const idPath = await this.idGenerator.generateId(personId);
      await prisma.person.update({
        where: { id: personId },
        data: { idCardImage: idPath },
      });
    } catch (error) {
      console.error("Failed to generate ID card:", error);
      throw new Error("Failed to generate ID card");
    }
  }

  private async validatePersonExists(id: string) {
    const person = await prisma.person.findUnique({ where: { id } });
    if (!person) throw new Error("Person not found");
  }
}
