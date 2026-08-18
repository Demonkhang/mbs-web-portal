import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/roles.guard';

export const categoriesRouter = Router();

// GET /api/v1/categories - Get all categories from PostgreSQL DB
categoriesRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return sendApiResponse(res, categories, 'Danh sách chuyên mục từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/categories/:id - Get category by ID from PostgreSQL DB
categoriesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!category) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy chuyên mục với ID '${id}' trong CSDL PostgreSQL.`,
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    return sendApiResponse(res, category, 'Chi tiết chuyên mục từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/categories - Create new category in PostgreSQL DB
categoriesRouter.post('/', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'EDITOR_LEAD', 'EDITOR']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug } = req.body;
    if (!name) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Tên chuyên mục là trường bắt buộc.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const newCategory = await prisma.category.create({
      data: { name, slug: cleanSlug },
    });

    return sendApiResponse(res, newCategory, 'Thêm mới chuyên mục vào CSDL PostgreSQL thành công', 201);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/categories/:id - Update category in PostgreSQL DB
categoriesRouter.put('/:id', JwtAuthGuard, RolesGuard(['SUPER_ADMIN', 'EDITOR_LEAD']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    const cleanSlug = slug
      ? slug.toLowerCase().replace(/\s+/g, '-')
      : name
      ? name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
      : undefined;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, slug: cleanSlug },
    });

    return sendApiResponse(res, updatedCategory, 'Cập nhật chuyên mục trong CSDL PostgreSQL thành công');
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/categories/:id - Delete category from PostgreSQL DB
categoriesRouter.delete('/:id', JwtAuthGuard, RolesGuard(['SUPER_ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    return sendApiResponse(res, { id, deleted: true }, 'Xóa chuyên mục thành công khỏi CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});
