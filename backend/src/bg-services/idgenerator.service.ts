// src/services/idGenerationService.ts
import { PrismaClient } from '@prisma/client'
import PDFDocument from 'pdfkit'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

export class IdGenerationService {
  private readonly OUTPUT_DIR = 'storage/ids'

  constructor() {
    // Ensure output directory exists
    if (!fs.existsSync(this.OUTPUT_DIR)) {
      fs.mkdirSync(this.OUTPUT_DIR, { recursive: true })
    }
  }

  async generateId(personId: string) {
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: { user: true }
    })

    if (!person) throw new Error('Person not found')

    const doc = new PDFDocument()
    const filename = `${person.id}_id.pdf`
    const filepath = path.join(this.OUTPUT_DIR, filename)
    
    doc.pipe(fs.createWriteStream(filepath))

    // Add ID card content
    doc
      .fontSize(25)
      .text(`${person.type} ID CARD`, {align: 'center'})
      .fontSize(15)
      .text(`Reg No: ${person.id}`)
      .text(`Name: ${person.firstName} ${person.lastName}`)
      
    // Add QR code
    if (person.qrCode) {
      doc.image(person.qrCode, { width: 100 })
    }

    // Add profile image if exists
    if (person.profileImage) {
      doc.image(person.profileImage, { width: 100 })
    }

    doc.end()

    // Update person record with ID card path
    await prisma.person.update({
      where: { id: personId },
      data: { idCardImage: filepath }
    })

    return filepath
  }
}