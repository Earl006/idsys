// src/bg-services/qrgenerator.service.ts
import QRCode from 'qrcode';

export class QRCodeGenerator {
  async generate(personId: string): Promise<string> {
    try {
      // Create QR code with person ID for tracking
      const qrData = JSON.stringify({
        id: personId,
        type: 'identification'
      });
      return await QRCode.toDataURL(qrData);
    } catch (err) {
      console.error('QR generation error:', err);
      throw new Error('Failed to generate QR code');
    }
  }
}