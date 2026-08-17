import { fetchApi } from './api-client';
import { LegalDocument, ApplicationTracking } from '@mbs/types';

export const documentsService = {
  async searchDocuments(query: string): Promise<LegalDocument[]> {
    try {
      return await fetchApi<LegalDocument[]>(`/documents?q=${encodeURIComponent(query)}`);
    } catch {
      return [];
    }
  },
};

export const submissionsService = {
  async trackSubmission(trackingCode: string): Promise<ApplicationTracking | null> {
    try {
      return await fetchApi<ApplicationTracking>(`/submissions/track/${encodeURIComponent(trackingCode)}`);
    } catch {
      return null;
    }
  },
};
