export type SubmissionStatus = 'tiep-nhan' | 'tham-dinh' | 'yeu-cau-bo-sung' | 'hoan-tat' | 'tu-choi';

export interface SubmissionStepHistoryDto {
  time: string;
  title: string;
  description: string;
  officer: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export interface SubmissionDto {
  trackingCode: string;
  serviceId?: string;
  serviceName: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  submissionDate: string;
  expectedDate: string;
  currentStep: number;
  status: SubmissionStatus;
  statusText: string;
  assignedOfficer: string;
  department: string;
  history: SubmissionStepHistoryDto[];
}

export interface CreateSubmissionDto {
  serviceId: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  notes?: string;
  attachments?: string[];
}
