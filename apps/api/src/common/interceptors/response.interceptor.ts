import { Request, Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

export function sendApiResponse<T>(
  res: Response,
  data: T,
  message = 'Thao tác thành công',
  statusCode = 200,
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number }
) {
  const responsePayload: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    statusCode,
    message,
    data,
    ...(meta ? { meta } : {}),
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(responsePayload);
}
