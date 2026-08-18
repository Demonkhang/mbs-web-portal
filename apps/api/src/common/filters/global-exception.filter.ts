import { Request, Response, NextFunction } from 'express';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  timestamp: string;
  invalidParams?: { field: string; message: string }[];
}

export function GlobalExceptionFilter(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // Silent log internal details to server logs only (never expose raw stack to client)
  console.error(`[MBS-API RFC7807 ERROR] ${req.method} ${req.originalUrl}:`, err);

  const errorObj = err as Record<string, unknown>;
  const statusCode = (typeof errorObj?.status === 'number' ? errorObj.status : null) ||
                     (typeof errorObj?.statusCode === 'number' ? errorObj.statusCode : null) || 500;
  
  let title = 'Internal Server Error';
  let detail = 'Hệ thống đã xảy ra sự cố kỹ thuật. Vui lòng thử lại sau.';
  let invalidParams: { field: string; message: string }[] | undefined;

  if (statusCode === 400) {
    title = 'Bad Request';
    detail = typeof errorObj?.message === 'string' ? errorObj.message : 'Dữ liệu yêu cầu không hợp lệ.';
    if (Array.isArray(errorObj?.invalidParams)) {
      invalidParams = errorObj.invalidParams as { field: string; message: string }[];
    }
  } else if (statusCode === 401) {
    title = 'Unauthorized';
    detail = typeof errorObj?.message === 'string' ? errorObj.message : 'Phiên làm việc hết hạn hoặc token không hợp lệ.';
  } else if (statusCode === 403) {
    title = 'Forbidden';
    detail = typeof errorObj?.message === 'string' ? errorObj.message : 'Bạn không có quyền thực hiện thao tác này.';
  } else if (statusCode === 404) {
    title = 'Not Found';
    detail = typeof errorObj?.message === 'string' ? errorObj.message : 'Tài nguyên yêu cầu không tồn tại.';
  } else if (statusCode === 429) {
    title = 'Too Many Requests';
    detail = typeof errorObj?.message === 'string' ? errorObj.message : 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.';
  }

  const problemDetails: ProblemDetails = {
    type: `https://mbs.hochiminhcity.gov.vn/errors/${title.toLowerCase().replace(/\s+/g, '-')}`,
    title,
    status: statusCode,
    detail,
    instance: req.originalUrl,
    timestamp: new Date().toISOString(),
    ...(invalidParams ? { invalidParams } : {}),
  };

  res.status(statusCode).json(problemDetails);
}
