import { PrismaClient, PersonType } from '@prisma/client';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

export class IdGenerationService {
  private readonly OUTPUT_DIR = 'storage/ids';
  private readonly TEMP_DIR = 'storage/temp';
  private readonly UPLOADS_DIR = 'uploads';
  private readonly CARD_WIDTH = 350;  // 3.5 inches
  private readonly CARD_HEIGHT = 230; // 2 inches
  private readonly LOGO_WIDTH = 50;
  private readonly LOGO_HEIGHT = 30; // Adjusted for better aspect ratio
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    // Create all required directories
    [this.OUTPUT_DIR, this.TEMP_DIR, this.UPLOADS_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private async base64ToImage(base64String: string): Promise<string> {
    try {
      const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) throw new Error('Invalid base64 string');
      
      const buffer = Buffer.from(matches[2], 'base64');
      const tempPath = path.join(this.TEMP_DIR, `temp_${Date.now()}.png`);
      await fs.promises.writeFile(tempPath, buffer);
      return tempPath;
    } catch (error) {
      console.error('Base64 conversion error:', error);
      throw new Error('Failed to convert base64 image');
    }
  }

  private async downloadImage(url: string): Promise<string> {
    try {
      // Handle local file path
      if (url.startsWith('/')) {
        if (!fs.existsSync(url)) {
          throw new Error(`Local file not found: ${url}`);
        }
        const tempPath = path.join(this.TEMP_DIR, `temp_${Date.now()}.png`);
        await fs.promises.copyFile(url, tempPath);
        return tempPath;
      }

      // Handle remote URL
      const response = await axios.get(url, { 
        responseType: 'arraybuffer',
        timeout: 5000 // 5 second timeout
      });
      const tempPath = path.join(this.TEMP_DIR, `temp_${Date.now()}.png`);
      await fs.promises.writeFile(tempPath, response.data);
      return tempPath;
    } catch (error) {
      console.error('Image download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown download error';
      throw new Error(`Failed to download image: ${errorMessage}`);
    }
  }

  private async cleanupFiles(files: string[]) {
    for (const file of files) {
      try {
        if (fs.existsSync(file)) {
          await fs.promises.unlink(file);
        }
      } catch (error) {
        console.error(`Failed to cleanup file ${file}:`, error);
      }
    }
  }

  private readonly SCHOOL_LOGO = 'https://www.tendersure.africa/wp-content/uploads/2024/08/Strathmore-University-Logo-4.png';

  async generateId(personId: string) {
    const imagePaths: string[] = [];
    try {
      const person = await this.prisma.person.findUnique({
        where: { id: personId },
        include: { user: true }
      });

      if (!person) throw new Error('Person not found');

      const doc = new PDFDocument({
        size: [this.CARD_WIDTH, this.CARD_HEIGHT],
        margin: 0
      });

      const filename = `${person.id}_id.pdf`;
      const filepath = path.join(this.OUTPUT_DIR, filename);
      doc.pipe(fs.createWriteStream(filepath));

      // Background
      doc.rect(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT)
         .fill('#ffffff');

      // Download and add school logo
      const logoPath = await this.downloadImage(this.SCHOOL_LOGO);
      imagePaths.push(logoPath);
      
      // Add logo at the top with proper aspect ratio
      doc.image(logoPath, (this.CARD_WIDTH - this.LOGO_WIDTH) / 2, 5, { 
        width: this.LOGO_WIDTH,
        height: this.LOGO_HEIGHT,
        align: 'center'
      });

      // Adjust subsequent elements' positions
      doc.rect(0, this.LOGO_HEIGHT + 10, this.CARD_WIDTH, 30)
         .fillColor(person.type === PersonType.STAFF ? '#2c3e50' : '#27ae60')
         .fill();

      // Header text (moved down)
      doc.fontSize(16)
         .fillColor('#ffffff')
         .font('Helvetica-Bold')
         .text(`${person.type} ID CARD`, 0, 45, { align: 'center' });

      // Profile Image (left side)
      if (person.profileImage) {
        const profilePath = await this.downloadImage(person.profileImage);
        imagePaths.push(profilePath);
        doc.image(profilePath, 20, 80, { 
          width: 100,
          height: 120
        });
        
        // Profile image border
        doc.rect(20, 80, 100, 120)
           .stroke('#000000');
      }

      // Details section (right side of profile)
      doc.fontSize(10)
         .fillColor('#000000')
         .font('Helvetica');

      const detailsX = 130;
      let detailsY = 85;
      
      doc.font('Helvetica-Bold')
         .text('Reg No:', detailsX, detailsY)
         .font('Helvetica')
         .text(person.id, detailsX + 50, detailsY);
      
      detailsY += 20;
      doc.font('Helvetica-Bold')
         .text('Name:', detailsX, detailsY)
         .font('Helvetica')
         .text(`${person.firstName} ${person.lastName}`, detailsX + 50, detailsY);
      
      detailsY += 20;
      doc.font('Helvetica-Bold')
         .text('Email:', detailsX, detailsY)
         .font('Helvetica')
         .text(person.user.email, detailsX + 50, detailsY);

      // QR Code (below details)
      if (person.qrCode) {
        const qrPath = await this.base64ToImage(person.qrCode);
        imagePaths.push(qrPath);
        doc.image(qrPath, detailsX, detailsY + 30, { 
          width: 60,
          height: 60 
        });
      }

      // Footer
      doc.fontSize(8)
         .fillColor('#666666')
         .text('Valid only with QR code', 20, this.CARD_HEIGHT - 20);

      doc.end();

      // Clean up temporary files
      await this.cleanupFiles(imagePaths);

      return filepath;
    } catch (error) {
      // Ensure cleanup on error
      await this.cleanupFiles(imagePaths);
      console.error('ID generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate ID card: ${errorMessage}`);
    }
  }
}