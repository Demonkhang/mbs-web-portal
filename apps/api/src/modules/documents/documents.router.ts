import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { JwtAuthGuard, OptionalJwtAuthGuard, PermissionGuard } from '../../common/guards/roles.guard';

export const documentsRouter = Router();

// Multer storage for legal documents isolated from Media Photo Gallery table
const docUploadDir = path.join(process.cwd(), 'uploads', 'documents');
if (!fs.existsSync(docUploadDir)) {
  fs.mkdirSync(docUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, docUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).toLowerCase().replace(/[^a-z0-9]/g, '-');
    cb(null, `${basename}-${Date.now()}${ext}`);
  },
});

const docUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
});

// POST /api/v1/documents/upload - Upload PDF / P7S files specifically for Legal Documents (Does NOT touch Media table)
documentsRouter.post('/upload', JwtAuthGuard, docUpload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/bad-request',
        title: 'Bad Request',
        status: 400,
        detail: 'Không tìm thấy tệp đính kèm nào được tải lên.',
        instance: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const file = req.file;
    const filename = file.filename;
    const originalName = file.originalname;
    const mimeType = file.mimetype;
    const size = file.size;
    const relativeUrl = `/uploads/documents/${filename}`;
    const url = `/uploads/documents/${filename}`;

    return sendApiResponse(
      res,
      {
        filename,
        originalName,
        mimeType,
        size,
        url,
        relativeUrl,
      },
      'Upload tệp văn bản pháp quy riêng biệt thành công',
      201
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/documents/search - Full-Text Legal Document Search from PostgreSQL DB
documentsRouter.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = (req.query.q as string || '').trim();
    const docType = req.query.docType as string;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const signer = req.query.signer as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const statusFilter = req.query.status as string; // Optional filter for admin

    const whereClause: any = {};
    // Public search only returns PUBLISHED documents by default
    if (statusFilter) {
      whereClause.approvalStatus = statusFilter;
    } else {
      whereClause.approvalStatus = 'PUBLISHED';
    }

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

// GET /api/v1/documents - List all legal documents (Admin / Public)
documentsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, docType } = req.query;
    const whereClause: any = {};
    if (status) whereClause.approvalStatus = status as string;
    if (docType) whereClause.docType = docType as string;

    const docs = await prisma.legalDocument.findMany({
      where: whereClause,
      orderBy: { issueDate: 'desc' },
    });
    return sendApiResponse(res, docs, 'Danh sách văn bản pháp quy từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/documents/approval-queue - List documents pending review for leadership
documentsRouter.get('/approval-queue', JwtAuthGuard, PermissionGuard('documents:review'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await prisma.legalDocument.findMany({
      where: { approvalStatus: 'PENDING_REVIEW' },
      orderBy: { updatedAt: 'desc' },
    });
    return sendApiResponse(res, docs, 'Danh sách hàng đợi phê duyệt văn bản');
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/documents/:id - Get legal document details by ID or code
documentsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const doc = await prisma.legalDocument.findFirst({
      where: {
        OR: [
          { id },
          { code: id },
        ],
      },
    });

    if (!doc) {
      return res.status(404).json({
        type: 'https://mbs.hochiminhcity.gov.vn/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Không tìm thấy văn bản với ID: ${id}`,
      });
    }

    return sendApiResponse(res, doc, 'Chi tiết văn bản pháp quy từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/documents/:id/history - Get document audit & activity timeline history
documentsRouter.get('/:id/history', JwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const doc = await prisma.legalDocument.findUnique({ where: { id } });
    if (!doc) {
      return res.status(404).json({ title: 'Not Found', status: 404, detail: 'Không tìm thấy văn bản' });
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        module: 'documents',
        OR: [
          { details: { contains: doc.code } },
          { details: { contains: doc.id } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendApiResponse(res, logs, 'Lấy nhật ký lịch sử hoạt động văn bản thành công');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/documents - Add legal document metadata & attachment
documentsRouter.post('/', JwtAuthGuard, PermissionGuard('documents:create'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const {
      code,
      title,
      docType,
      issuingAgency,
      signer,
      issueDate,
      effectiveDate,
      expirationDate,
      status,
      approvalStatus,
      domain,
      fileSize,
      fileUrl,
      p7sSignatureUrl,
      htmlContent,
      attachments,
      isConfidentialChecked,
      fullText,
    } = req.body;

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
        approvalStatus: approvalStatus || 'DRAFT',
        domain: domain || 'Môi trường',
        fileSize: fileSize || '2.5 MB',
        fileUrl: fileUrl || '/uploads/documents/van-ban-mbs-2026.pdf',
        p7sSignatureUrl: p7sSignatureUrl || null,
        htmlContent: htmlContent || null,
        attachments: Array.isArray(attachments) ? attachments : [],
        isConfidentialChecked: isConfidentialChecked !== undefined ? Boolean(isConfidentialChecked) : true,
        authorId: user?.id || null,
        fullText,
      },
    });

    // Create Audit Log entry
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_DOCUMENT_DRAFT',
        module: 'documents',
        userId: user?.id || null,
        ipAddress: req.ip || '127.0.0.1',
        details: `Khởi tạo bản thảo văn bản [${doc.code}] - ${doc.title}`,
      },
    });

    return sendApiResponse(res, doc, 'Tạo mới văn bản pháp quy thành công', 201);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/documents/:id/submit - Submit document for leadership approval
documentsRouter.patch('/:id/submit', JwtAuthGuard, PermissionGuard('documents:create'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const existing = await prisma.legalDocument.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ title: 'Not Found', status: 404, detail: 'Không tìm thấy văn bản' });
    }

    const updated = await prisma.legalDocument.update({
      where: { id },
      data: {
        approvalStatus: 'PENDING_REVIEW',
        rejectionReason: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'SUBMIT_DOCUMENT_FOR_REVIEW',
        module: 'documents',
        userId: user?.id || null,
        ipAddress: req.ip || '127.0.0.1',
        details: `Trình duyệt văn bản [${updated.code}] lên Lãnh đạo`,
      },
    });

    return sendApiResponse(res, updated, 'Đã trình duyệt văn bản lên Lãnh đạo thành công');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/documents/:id/approve - Leadership approves and publishes document
documentsRouter.patch('/:id/approve', JwtAuthGuard, PermissionGuard('documents:approve'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const existing = await prisma.legalDocument.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ title: 'Not Found', status: 404, detail: 'Không tìm thấy văn bản' });
    }

    const updated = await prisma.legalDocument.update({
      where: { id },
      data: {
        approvalStatus: 'PUBLISHED',
        approverId: user?.id || null,
        rejectionReason: null,
      },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'APPROVE_PUBLISH_DOCUMENT',
        module: 'documents',
        userId: user?.id || null,
        ipAddress: req.ip || '127.0.0.1',
        details: `Phê duyệt phát hành công khai văn bản [${updated.code}] - ${updated.title}`,
      },
    });

    return sendApiResponse(res, updated, 'Phê duyệt & Xuất bản văn bản công khai thành công');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/documents/:id/reject - Leadership rejects document with reason
documentsRouter.patch('/:id/reject', JwtAuthGuard, PermissionGuard('documents:approve'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = (req as any).user;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ title: 'Bad Request', status: 400, detail: 'Bắt buộc nhập lý do khi từ chối văn bản' });
    }

    const existing = await prisma.legalDocument.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ title: 'Not Found', status: 404, detail: 'Không tìm thấy văn bản' });
    }

    const updated = await prisma.legalDocument.update({
      where: { id },
      data: {
        approvalStatus: 'REJECTED',
        approverId: user?.id || null,
        rejectionReason: reason.trim(),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'REJECT_DOCUMENT',
        module: 'documents',
        userId: user?.id || null,
        ipAddress: req.ip || '127.0.0.1',
        details: `Từ chối phát hành văn bản [${updated.code}]. Lý do: ${reason.trim()}`,
      },
    });

    return sendApiResponse(res, updated, 'Đã trả lại văn bản yêu cầu chỉnh sửa');
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/documents/:id - Edit document
documentsRouter.put('/:id', OptionalJwtAuthGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const {
      code,
      title,
      docType,
      issuingAgency,
      signer,
      issueDate,
      effectiveDate,
      expirationDate,
      status,
      approvalStatus,
      domain,
      fileSize,
      fileUrl,
      p7sSignatureUrl,
      htmlContent,
      attachments,
      isConfidentialChecked,
      fullText,
      scheduledPublishDate,
      rejectionReason,
    } = req.body;

    const existing = await prisma.legalDocument.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ title: 'Not Found', status: 404, detail: 'Không tìm thấy văn bản trong CSDL' });
    }

    const updateFields: any = {};
    if (code) updateFields.code = code;
    if (title) updateFields.title = title;
    if (docType) updateFields.docType = docType;
    if (issuingAgency) updateFields.issuingAgency = issuingAgency;
    if (signer !== undefined) updateFields.signer = signer;
    if (issueDate) updateFields.issueDate = new Date(issueDate);
    if (effectiveDate) updateFields.effectiveDate = new Date(effectiveDate);
    if (expirationDate !== undefined) updateFields.expirationDate = expirationDate ? new Date(expirationDate) : null;
    if (status) updateFields.status = status;
    if (approvalStatus) updateFields.approvalStatus = approvalStatus;
    if (domain) updateFields.domain = domain;
    if (fileSize !== undefined) updateFields.fileSize = fileSize;
    if (fileUrl !== undefined) updateFields.fileUrl = fileUrl;
    if (p7sSignatureUrl !== undefined) updateFields.p7sSignatureUrl = p7sSignatureUrl;
    if (htmlContent !== undefined) updateFields.htmlContent = htmlContent;
    if (fullText !== undefined) updateFields.fullText = fullText;
    if (isConfidentialChecked !== undefined) updateFields.isConfidentialChecked = Boolean(isConfidentialChecked);
    if (attachments !== undefined) updateFields.attachments = Array.isArray(attachments) ? attachments : [];
    if (scheduledPublishDate !== undefined) {
      updateFields.scheduledPublishDate = scheduledPublishDate ? new Date(scheduledPublishDate) : null;
    }
    if (rejectionReason !== undefined) updateFields.rejectionReason = rejectionReason;

    const doc = await prisma.legalDocument.update({
      where: { id },
      data: updateFields,
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_DOCUMENT_METADATA',
          module: 'documents',
          userId: user?.id || null,
          ipAddress: req.ip || '127.0.0.1',
          details: `Chỉnh sửa cập nhật metadata văn bản [${doc.code}] - ${doc.title}`,
        },
      });
    } catch (e) {}

    return sendApiResponse(res, doc, 'Cập nhật văn bản pháp quy thành công vào CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/documents/:id - Delete document
documentsRouter.delete('/:id', JwtAuthGuard, PermissionGuard('documents:delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const doc = await prisma.legalDocument.findUnique({ where: { id } });

    await prisma.legalDocument.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_DOCUMENT',
        module: 'documents',
        userId: user?.id || null,
        ipAddress: req.ip || '127.0.0.1',
        details: `Xóa văn bản pháp quy [${doc?.code || id}]`,
      },
    });

    return sendApiResponse(res, { id, deleted: true }, 'Xóa văn bản pháp quy thành công');
  } catch (error) {
    next(error);
  }
});
