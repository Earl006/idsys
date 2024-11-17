// src/bg-services/cloudinary.service.ts
import { v2 as cloudinary } from 'cloudinary';

export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'idsys',
        resource_type: 'auto'
      });
      return result.secure_url;
    } catch (error) {
      throw new Error('Failed to upload image');
    }
  }
}