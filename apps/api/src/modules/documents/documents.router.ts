import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/roles.guard';

export const documentsRouter = Router();

// GET /api/v1/documents/search - Full-Text Legal Document Search from PostgreSQL DB
documentsRouter.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = (req.query.q as string || '').trim();
    const docType = req.query.docType as string;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const signer = req.query.signer as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const whereClause: any = {};
    if (docType) whereClause.docType = docType;
    if (signer) whereClause.signer = { contains: signer, mode: 'insensitive' };
    if (year) {
      whereClause.issueDate = {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lte: new Date(`${year}-12-31T23:59:59.999Z`),
      };
    }
    if (q) {
      whereClause.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { fullText: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [rawDocs, total] = await Promise.all([
      prisma.legalDocument.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { issueDate: 'desc' },
      }),
      prisma.legalDocument.count({ where: whereClause }),
    ]);

    const docs = rawDocs.map((doc) => {
      let rankingScore = 0.5;
      let highlightedSnippet = (doc.fullText || '').substring(0, 200) + '...';

      if (q) {
        const lowerQ = q.toLowerCase();
        if (doc.title?.toLowerCase().includes(lowerQ)) rankingScore += 0.4;
        if (doc.code?.toLowerCase().includes(lowerQ)) rankingScore += 0.5;

        const regex = new RegExp(`(${q})`, 'gi');
        const matchIdx = (doc.fullText || '').toLowerCase().indexOf(lowerQ);
        if (matchIdx !== -1) {
          const start = Math.max(0, matchIdx - 40);
          const end = Math.min(doc.fullText.length, matchIdx + 160);
          highlightedSnippet = '...' + doc.fullText.substring(start, end).replace(regex, '<mark>$1</mark>') + '...';
        }
      }

      return {
        ...doc,
        rankingScore: Math.min(1.0, rankingScore),
        highlightedSnippet,
      };
    });

    return sendApiResponse(res, docs, 'Tìm kiếm văn bản pháp quy từ CSDL PostgreSQL thành công', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/documents - List all legal documents from PostgreSQL DB
documentsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await prisma.legalDocument.findMany({
      orderBy: { issueDate: 'desc' },
    });
    return sendApiResponse(res, docs, 'Danh sách văn bản pháp quy thực tế từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/documents - Add legal document metadata & attachment to PostgreSQL DB
documentsRouter.post('/', JwtAuthGuard, RolesGuard(['OFFICER', 'SUPER_ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, title, docType, issuingAgency, signer, issueDate, effectiveDate, expirationDate, status, domain, fileSize, fileUrl, fullText } = req.body;

    if (!code || !title || !docType || !issuingAgency || !fullText) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Số hiệu, trích yếu, loại văn bản, cơ quan ban hành và toàn văn là bắt buộc.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const doc = await prisma.legalDocument.create({
      data: {
        code,
        title,
        docType,
        issuingAgency,
        signer: signer || 'Ban Giám đốc MBS',
        issueDate: new Date(issueDate || Date.now()),
        effectiveDate: new Date(effectiveDate || Date.now()),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        status: status || 'Còn hiệu lực',
        domain: domain || 'Môi trường',
        fileSize: fileSize || '2.5 MB',
        fileUrl: fileUrl || '/uploads/documents/van-ban-mbs-2026.pdf',
        fullText,
      },
    });

    return sendApiResponse(res, doc, 'Thêm mới văn bản pháp quy vào CSDL PostgreSQL thành công', 201);
  } catch (error) {
    next(error);
  }
});
