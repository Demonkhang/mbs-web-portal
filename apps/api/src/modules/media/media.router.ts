import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { JwtAuthGuard } from '../../common/guards/roles.guard';
import { StorageService } from '../../common/services/storage.service';

export const mediaRouter = Router();

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, StorageService.getUploadDir());
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `mbs_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext || '.jpg'}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận các định dạng ảnh (JPG, PNG, WEBP, GIF, SVG) và tài liệu PDF'));
  }
};

const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);

const upload = multer({
  storage,
  limits: { fileSize: maxFileSizeMB * 1024 * 1024 },
  fileFilter,
});

// POST /api/v1/media/upload - Upload files with rich metadata
mediaRouter.post(
  '/upload',
  upload.fields([
    { name: 'files', maxCount: 10 },
    { name: 'file', maxCount: 1 },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqFiles = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      let rawFileList: Express.Multer.File[] = [];

      if (reqFiles?.files && reqFiles.files.length > 0) {
        rawFileList = reqFiles.files;
      } else if (reqFiles?.file && reqFiles.file.length > 0) {
        rawFileList = reqFiles.file;
      }

      if (!rawFileList || rawFileList.length === 0) {
        return res.status(400).json({
          type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
          title: 'Bad Request',
          status: 400,
          detail: 'Không tìm thấy tệp ảnh nào được gửi lên.',
          instance: req.originalUrl,
          timestamp: new Date().toISOString(),
        });
      }

      const { title, description, category, caption, isFeatured, tags } = req.body || {};
      const userId = (req as any).user?.id || null;
      const host = req.get('host') || 'localhost:4000';
      const protocol = req.protocol || 'http';

      const savedRecords = [];

      for (let i = 0; i < rawFileList.length; i++) {
        const file = rawFileList[i];
        const savedMeta = await StorageService.saveUploadedFile(file, protocol, host);

        const customTitle = title || file.originalname;
        const customCategory = category || 'Khu Đa Phước';
        const customDescription = description || `Hình ảnh tư liệu ${customTitle} được lưu trữ trong CSDL.`;
        const featuredBool = isFeatured === 'true' || isFeatured === true;

        const mediaRecord = await (prisma as any).media.create({
          data: {
            title: customTitle,
            description: customDescription,
            category: customCategory,
            caption: caption || null,
            isFeatured: featuredBool,
            tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
            originalName: savedMeta.originalName,
            filename: savedMeta.filename,
            mimeType: savedMeta.mimeType,
            size: savedMeta.size,
            url: savedMeta.url,
            relativeUrl: savedMeta.relativeUrl,
            storageDriver: savedMeta.storageDriver,
            uploadedById: userId,
          },
        });

        savedRecords.push(mediaRecord);
      }

      return sendApiResponse(
        res,
        savedRecords,
        `Tải lên thành công ${savedRecords.length} tệp kèm thông tin metadata vào CSDL PostgreSQL`,
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/media - Get all media items (supports category, isFeatured, search, pagination)
mediaRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';
    const isFeatured = req.query.isFeatured;
    const skip = (page - 1) * limit;

    const host = req.get('host') || 'localhost:4000';
    const protocol = req.protocol || 'http';

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { filename: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'Tất cả') {
      whereClause.category = category;
    }

    if (isFeatured !== undefined && isFeatured !== '') {
      whereClause.isFeatured = isFeatured === 'true';
    }

    let [items, total] = await Promise.all([
      (prisma as any).media.findMany({
        where: whereClause,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      (prisma as any).media.count({ where: whereClause }),
    ]);

    // Self-healing migration for existing local files if DB is empty
    if (total === 0 && !search && !category) {
      const uploadDir = StorageService.getUploadDir();
      if (fs.existsSync(uploadDir)) {
        const filenames = fs.readdirSync(uploadDir);
        const imageFiles = filenames.filter((fn) =>
          /\.(jpg|jpeg|png|webp|gif|svg|pdf)$/i.test(fn)
        );

        if (imageFiles.length > 0) {
          for (const filename of imageFiles) {
            const filePath = path.join(uploadDir, filename);
            const stat = fs.statSync(filePath);
            const relativeUrl = `/uploads/${filename}`;
            const url = StorageService.getPublicUrl(filename, protocol, host);
            const mimeType = filename.endsWith('.pdf') ? 'application/pdf' : 'image/webp';

            try {
              await (prisma as any).media.create({
                data: {
                  title: filename,
                  description: `Hình ảnh tư liệu ${filename}`,
                  category: 'Khu Đa Phước',
                  isFeatured: false,
                  originalName: filename,
                  filename,
                  mimeType,
                  size: stat.size,
                  url,
                  relativeUrl,
                  storageDriver: process.env.STORAGE_DRIVER || 'local',
                  createdAt: stat.birthtime,
                },
              });
            } catch (err) {
              // Ignore duplicate errors during migration
            }
          }

          items = await (prisma as any).media.findMany({
            orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
            skip,
            take: limit,
          });
          total = await (prisma as any).media.count();
        }
      }
    }

    return sendApiResponse(
      res,
      {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      'Danh sách hình ảnh đa phương tiện từ CSDL PostgreSQL'
    );
  } catch (error) {
    next(error);
  }
});

// Helper to create slug
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// GET /api/v1/media/categories - Get active categories list from PostgreSQL CSDL
mediaRouter.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let dbCategories = await (prisma as any).mediaCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    // Seed default categories if DB table is empty
    if (!dbCategories || dbCategories.length === 0) {
      const defaultNames = [
        'Khu Đa Phước',
        'Khu Phước Hiệp',
        'Công nghệ Môi trường',
        'Năng lượng tái tạo',
        'Giám sát kỹ thuật',
      ];

      for (let i = 0; i < defaultNames.length; i++) {
        const name = defaultNames[i];
        try {
          await (prisma as any).mediaCategory.create({
            data: {
              name,
              slug: slugify(name),
              sortOrder: i,
            },
          });
        } catch (err) {
          // Ignore duplicate errors
        }
      }

      dbCategories = await (prisma as any).mediaCategory.findMany({
        orderBy: { sortOrder: 'asc' },
      });
    }

    const categoryNames = dbCategories.map((c: any) => c.name);

    return sendApiResponse(res, categoryNames, 'Danh sách danh mục thư viện đa phương tiện từ CSDL');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/media/categories - Add new media category to PostgreSQL CSDL
mediaRouter.post('/categories', JwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Vui lòng cung cấp tên danh mục hợp lệ.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const trimmedName = name.trim();
    const slug = slugify(trimmedName);

    const created = await (prisma as any).mediaCategory.upsert({
      where: { name: trimmedName },
      update: {},
      create: {
        name: trimmedName,
        slug,
      },
    });

    return sendApiResponse(res, created, `Đã thêm danh mục "${trimmedName}" vào CSDL thành công`, 201);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/media/categories/stats - Get categories list with items count
mediaRouter.get('/categories/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let dbCategories = await (prisma as any).mediaCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    if (!dbCategories || dbCategories.length === 0) {
      const defaultNames = [
        'Khu Đa Phước',
        'Khu Phước Hiệp',
        'Công nghệ Môi trường',
        'Năng lượng tái tạo',
        'Giám sát kỹ thuật',
      ];
      dbCategories = defaultNames.map((name) => ({ name }));
    }

    const mediaItems = await (prisma as any).media.findMany({
      select: { category: true },
    });

    const countsMap: Record<string, number> = {};

    dbCategories.forEach((cat: any) => {
      countsMap[cat.name] = 0;
    });

    mediaItems.forEach((item: any) => {
      const cat = item.category || 'Khu Đa Phước';
      countsMap[cat] = (countsMap[cat] || 0) + 1;
    });

    const stats = Object.keys(countsMap).map((cat) => ({
      category: cat,
      count: countsMap[cat],
    }));

    return sendApiResponse(res, stats, 'Thống kê số lượng theo danh mục từ CSDL');
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/media/categories/rename - Rename an existing media category in PostgreSQL CSDL
mediaRouter.put('/categories/rename', JwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oldCategory, newCategory } = req.body;

    if (!oldCategory || !newCategory || oldCategory.trim() === '' || newCategory.trim() === '') {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Vui lòng cung cấp tên danh mục cũ và tên danh mục mới hợp lệ.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const trimmedNew = newCategory.trim();
    const newSlug = slugify(trimmedNew);

    // Update in media_categories table
    await (prisma as any).mediaCategory.updateMany({
      where: { name: oldCategory },
      data: { name: trimmedNew, slug: newSlug },
    });

    // Update in media table
    const updateResult = await (prisma as any).media.updateMany({
      where: { category: oldCategory },
      data: { category: trimmedNew },
    });

    return sendApiResponse(
      res,
      { count: updateResult.count, oldCategory, newCategory: trimmedNew },
      `Đã đổi tên danh mục "${oldCategory}" thành "${trimmedNew}" trong CSDL`
    );
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/media/categories - Delete a media category permanently from PostgreSQL CSDL
mediaRouter.delete('/categories', JwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, targetCategory } = req.body;

    if (!category) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Vui lòng cung cấp tên danh mục cần xóa.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const replacement = targetCategory || 'Khu Đa Phước';

    // Delete record from media_categories table
    await (prisma as any).mediaCategory.deleteMany({
      where: { name: category },
    });

    // Reassign media items in media table
    const updateResult = await (prisma as any).media.updateMany({
      where: { category },
      data: { category: replacement },
    });

    return sendApiResponse(
      res,
      { count: updateResult.count, deletedCategory: category, reassignedTo: replacement },
      `Đã xóa danh mục "${category}" vĩnh viễn khỏi CSDL PostgreSQL`
    );
  } catch (error) {
    next(error);
  }
});




// PATCH /api/v1/media/:id - Update metadata for a media record (Title, Description, Category, Caption, isFeatured)
mediaRouter.patch('/:id', JwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, category, caption, isFeatured, tags } = req.body;

    const existingRecord = await (prisma as any).media.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Không tìm thấy hình ảnh cần cập nhật.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (caption !== undefined) updateData.caption = caption;
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [tags];

    const updatedRecord = await (prisma as any).media.update({
      where: { id },
      data: updateData,
    });

    return sendApiResponse(res, updatedRecord, 'Cập nhật thông tin hình ảnh thành công');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/media/batch-delete - Delete multiple media records at once
mediaRouter.post('/batch-delete', JwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Vui lòng chọn ít nhất một hình ảnh để xóa.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const records = await (prisma as any).media.findMany({
      where: { id: { in: ids } },
    });

    // Delete physical files
    for (const record of records) {
      await StorageService.deleteFile(record.filename);
    }

    // Delete DB records
    const deleteResult = await (prisma as any).media.deleteMany({
      where: { id: { in: ids } },
    });

    return sendApiResponse(
      res,
      { count: deleteResult.count },
      `Đã xóa thành công ${deleteResult.count} hình ảnh khỏi CSDL và máy chủ`
    );
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/media/:id - Delete single media file
mediaRouter.delete('/:id', JwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const mediaRecord = await (prisma as any).media.findUnique({
      where: { id },
    });

    if (!mediaRecord) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Không tìm thấy hình ảnh cần xóa.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    await StorageService.deleteFile(mediaRecord.filename);

    await (prisma as any).media.delete({
      where: { id },
    });

    return sendApiResponse(res, { id }, 'Đã xóa hình ảnh thành công');
  } catch (error) {
    next(error);
  }
});
