import path from 'path';
import fs from 'fs';

export interface StorageSaveResult {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  relativeUrl: string;
  storageDriver: string;
}

export class StorageService {
  private static get driver(): 'local' | 's3' {
    return (process.env.STORAGE_DRIVER as 'local' | 's3') || 'local';
  }

  public static getUploadDir(): string {
    const uploadPath = process.env.LOCAL_UPLOAD_PATH || './uploads';
    const absolutePath = path.isAbsolute(uploadPath)
      ? uploadPath
      : path.join(process.cwd(), uploadPath);

    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, { recursive: true });
    }
    return absolutePath;
  }

  public static getPublicUrl(filename: string, reqProtocol?: string, reqHost?: string): string {
    if (this.driver === 's3' && process.env.S3_ENDPOINT && process.env.S3_BUCKET) {
      return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${filename}`;
    }

    const customPublicUrl = process.env.STORAGE_PUBLIC_URL;
    if (customPublicUrl && !customPublicUrl.includes('localhost') && !customPublicUrl.includes('127.0.0.1')) {
      const cleanBase = customPublicUrl.replace(/\/+$/, '');
      return `${cleanBase}/${filename}`;
    }

    // Return relative path by default to prevent hardcoded localhost issues across remote devices
    return `/uploads/${filename}`;
  }

  public static async saveUploadedFile(
    file: Express.Multer.File,
    reqProtocol?: string,
    reqHost?: string
  ): Promise<StorageSaveResult> {
    const filename = file.filename;
    const originalName = file.originalname;
    const mimeType = file.mimetype;
    const size = file.size;
    const relativeUrl = `/uploads/${filename}`;
    const url = this.getPublicUrl(filename, reqProtocol, reqHost);

    // Default local disk storage is handled by Multer destination
    return {
      filename,
      originalName,
      mimeType,
      size,
      url,
      relativeUrl,
      storageDriver: this.driver,
    };
  }

  public static async deleteFile(filename: string): Promise<boolean> {
    try {
      const uploadDir = this.getUploadDir();
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting file ${filename}:`, error);
      return false;
    }
  }
}
