import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { person: true }
    })
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials')
    }

    if (!['ADMIN', 'SECURITY'].includes(user.role)) {
      throw new Error('Unauthorized access')
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    )

    return { token, user }
  }
}