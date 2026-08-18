import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { JwtAuthGuard } from '../../common/guards/roles.guard';

export const mediaRouter = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const uniqueName = `mbs_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext || '.jpg'}`;
    cb(null, uniqueName);
  },
});

// File filter (Only Images)
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận các định dạng ảnh: JPG, PNG, WEBP, GIF, SVG'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter,
});

// POST /api/v1/media/upload - Upload single or multiple image files from local computer
mediaRouter.post('/upload', JwtAuthGuard, upload.array('files', 10), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Không tìm thấy tệp ảnh nào được gửi lên.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const host = req.get('host') || 'localhost:4000';
    const protocol = req.protocol || 'http';

    const uploadedFiles = files.map((file) => {
      const relativeUrl = `/uploads/${file.filename}`;
      const fullUrl = `${protocol}://${host}${relativeUrl}`;
      return {
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        mimeType: file.mimetype,
        url: fullUrl,
        relativeUrl,
      };
    });

    return sendApiResponse(
      res,
      uploadedFiles,
      `Tải lên thành công ${uploadedFiles.length} tệp ảnh vào máy chủ CSDL PostgreSQL`,
      201
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/media - List all uploaded media files
mediaRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const host = req.get('host') || 'localhost:4000';
    const protocol = req.protocol || 'http';

    if (!fs.existsSync(uploadsDir)) {
      return sendApiResponse(res, [], 'Danh sách thư viện media rỗng');
    }

    const filenames = fs.readdirSync(uploadsDir);
    const mediaFiles = filenames
      .filter((fn) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fn))
      .map((filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stat = fs.statSync(filePath);
        const relativeUrl = `/uploads/${filename}`;
        return {
          filename,
          size: stat.size,
          createdAt: stat.birthtime,
          url: `${protocol}://${host}${relativeUrl}`,
          relativeUrl,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return sendApiResponse(res, mediaFiles, 'Danh sách tệp ảnh trong thư viện media');
  } catch (error) {
    next(error);
  }
});
