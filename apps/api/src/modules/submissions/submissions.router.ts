import { Router, Request, Response } from 'express';

export const submissionsRouter = Router();

submissionsRouter.post('/', (req: Request, res: Response) => {
  const trackingCode = `MBS-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  res.status(201).json({
    message: 'Nộp hồ sơ trực tuyến thành công!',
    trackingCode,
    status: 'tiep-nhan',
    submissionDate: new Date().toISOString(),
  });
});

submissionsRouter.get('/track/:code', (req: Request, res: Response) => {
  res.json({
    trackingCode: req.params.code,
    status: 'tiep-nhan',
    statusText: 'Đã tiếp nhận hồ sơ trên hệ thống',
  });
});
