import { Router, Request, Response } from 'express';

export const documentsRouter = Router();

documentsRouter.get('/', (req: Request, res: Response) => {
  const { q, docType, domain } = req.query;
  res.json({
    query: q || '',
    docType: docType || 'all',
    domain: domain || 'all',
    total: 0,
    documents: [],
  });
});

documentsRouter.get('/:id', (req: Request, res: Response) => {
  res.json({
    id: req.params.id,
    code: '08/2022/NĐ-CP',
    title: 'Văn bản pháp quy về quản lý chất thải',
  });
});
