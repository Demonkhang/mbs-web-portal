export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} - ${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

// Text-to-speech helper for accessibility
export class VietnameseTTS {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;

  static speak(text: string, onEnd?: () => void, rate: number = 1.0) {
    if (!this.synth) return;
    this.stop();

    const cleanText = text.replace(/<[^>]*>?/gm, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = rate;

    // Try finding Vietnamese voice
    const voices = this.synth.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VN'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  static pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  static resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  static stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  static isSpeaking(): boolean {
    return !!this.synth && this.synth.speaking;
  }
}

export function normalizeMediaUrl(url?: string): string {
  if (!url) return '';
  let clean = url.trim();
  // If the file URL contains hardcoded localhost or 127.0.0.1 (e.g. from local DB uploads),
  // strip the domain part so it becomes a relative path like /uploads/...
  if (
    clean.startsWith('http://localhost') ||
    clean.startsWith('https://localhost') ||
    clean.startsWith('http://127.0.0.1') ||
    clean.startsWith('https://127.0.0.1')
  ) {
    try {
      const parsed = new URL(clean);
      clean = parsed.pathname;
    } catch {
      clean = clean.replace(/^https?:\/\/[^\/]+/, '');
    }
  }
  return clean;
}

export function getAbsolutePdfUrl(fileUrl?: string): string | null {
  if (!fileUrl) return null;

  let cleanPath = normalizeMediaUrl(fileUrl);
  if (!cleanPath) return null;

  // Blob URLs or external CDNs/S3 (e.g. https://s3.amazonaws.com)
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://') || cleanPath.startsWith('blob:')) {
    return cleanPath;
  }

  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

  // If VITE_API_URL is explicitly set to an external remote domain/IP (not localhost), use it
  const apiBase = (import.meta as any).env?.VITE_API_URL;
  if (apiBase && (apiBase.startsWith('http://') || apiBase.startsWith('https://'))) {
    try {
      const urlObj = new URL(apiBase);
      if (!urlObj.hostname.includes('localhost') && urlObj.hostname !== '127.0.0.1') {
        const serverHost = apiBase.replace(/\/api\/?$/, '');
        return `${serverHost}${cleanPath}`;
      }
    } catch {
      // ignore
    }
  }

  // Relative path works across ALL devices (Mobile, iPad, PC, Docker, LAN, WAN)
  // because the browser resolves relative paths against window.location.origin
  return cleanPath;
}

export async function downloadPdfFile(
  fileUrl: string | undefined,
  fileCode: string,
  onToast?: (title: string, msg: string, type: 'info' | 'success' | 'warning' | 'error') => void
): Promise<void> {
  const fullUrl = getAbsolutePdfUrl(fileUrl || '/uploads/documents/van-ban-mbs-2026.pdf');
  if (!fullUrl) {
    if (onToast) onToast('Thông báo', 'Chưa có đường dẫn tệp PDF cho văn bản này', 'warning');
    return;
  }

  const safeFilename = `${(fileCode || 'van-ban').replace(/[/\\?%*:|"<>]/g, '_')}.pdf`;

  try {
    if (onToast) onToast('Đang xử lý tải về', `Đang chuẩn bị tệp PDF: ${fileCode}...`, 'info');

    const response = await fetch(fullUrl);
    if (!response.ok) throw new Error(`Máy chủ trả về mã lỗi: ${response.status}`);

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    if (onToast) onToast('Tải thành công', `Đã lưu tệp ${safeFilename} về máy tính`, 'success');
  } catch (err) {
    console.warn('Blob fetch failed, falling back to direct download:', err);
    const link = document.createElement('a');
    link.href = fullUrl;
    link.target = '_blank';
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onToast) onToast('Thông báo', `Đã mở tệp ${safeFilename} trong cửa sổ tải về`, 'info');
  }
}

