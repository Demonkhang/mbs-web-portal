export type DocumentType = 'Nghị định' | 'Thông tư' | 'Quyết định' | 'Kế hoạch' | 'Thông báo' | 'Công văn';
export type DocumentDomain = 'Môi trường' | 'Quản lý chất thải rắn' | 'Đầu tư - Xây dựng' | 'Hành chính - Nhân sự' | 'Tài chính - Đấu thầu';
export type DocumentStatus = 'con-hieu-luc' | 'het-hieu-luc' | 'chua-hieu-luc' | 'bi-thay-the';

export interface DocumentDto {
  id: string;
  code: string;
  title: string;
  docType: DocumentType;
  issuingAgency: string;
  signer: string;
  issueDate: string;
  effectiveDate: string;
  expirationDate?: string;
  status: DocumentStatus;
  domain: DocumentDomain;
  fileSize: string;
  fileUrl?: string;
  downloadsCount: number;
  viewsCount: number;
  fullText: string;
}

export interface DocumentSearchQueryDto {
  keyword?: string;
  docType?: string;
  domain?: string;
  issuingAgency?: string;
  status?: string;
  year?: string;
  page?: number;
  limit?: number;
}
