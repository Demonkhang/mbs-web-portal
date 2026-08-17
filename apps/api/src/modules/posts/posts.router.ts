import { Router, Request, Response } from 'express';

export const postsRouter = Router();

postsRouter.get('/', (req: Request, res: Response) => {
  const { category, page = 1, limit = 10 } = req.query;
  res.json({
    data: [],
    page: Number(page),
    limit: Number(limit),
    total: 0,
  });
});

postsRouter.get('/:idOrSlug', (req: Request, res: Response) => {
  res.json({
    id: req.params.idOrSlug,
    title: 'Bài viết mẫu MBS',
    slug: req.params.idOrSlug,
    content: 'Nội dung chi tiết bài viết...',
  });
});

postsRouter.post('/', (req: Request, res: Response) => {
  res.status(201).json({
    message: 'Tạo bài viết mới thành công, chờ phê duyệt 3 bước.',
    id: 'post-' + Date.now(),
    status: 'PENDING_APPROVAL',
  });
});

postsRouter.put('/:id/approve', (req: Request, res: Response) => {
  res.json({
    message: 'Bài viết đã được duyệt và đăng tải thành công.',
    status: 'PUBLISHED',
  });
});
