// src/bg-services/qrgenerator.service.ts
import QRCode from 'qrcode';

export class QRCodeGenerator {
  async generate(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data);
    } catch (err) {
      throw new Error('Failed to generate QR code');
    }
  }
}