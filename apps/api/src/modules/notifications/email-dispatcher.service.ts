import { NotificationType } from '@mbs/database';

export interface SendEmailPayload {
  toEmail: string;
  toName: string;
  type: NotificationType;
  title: string;
  content: string;
  linkUrl?: string;
  metadata?: any;
}

export class EmailDispatcherService {
  /**
   * Generates a modern, governmental HTML email template for Ban Quản lý MBS TP.HCM
   */
  private static generateHtmlTemplate(payload: SendEmailPayload): string {
    const { toName, type, title, content, linkUrl } = payload;
    const currentYear = new Date().getFullYear();
    const actionUrl = linkUrl ? `http://localhost:3000/#${linkUrl}` : 'http://localhost:3000/#/admin/dashboard';

    let badgeText = 'THÔNG BÁO HỆ THỐNG';
    let badgeBg = '#0f766e'; // teal-700

    if (type === NotificationType.TASK_ASSIGNED) {
      badgeText = 'GIAO NHIỆM VỤ MỚI';
      badgeBg = '#0284c7'; // sky-600
    } else if (type === NotificationType.POST_APPROVED) {
      badgeText = 'ĐÃ PHÊ DUYỆT BÀI VIẾT';
      badgeBg = '#16a34a'; // green-600
    } else if (type === NotificationType.POST_REJECTED) {
      badgeText = 'YÊU CẦU CHỈNH SỬA / TỪ CHỐI';
      badgeBg = '#dc2626'; // red-600
    } else if (type === NotificationType.ROLE_UPDATED) {
      badgeText = 'CẬP NHẬT PHÂN QUYỀN';
      badgeBg = '#9333ea'; // purple-600
    } else if (type === NotificationType.SUBMISSION_NEW) {
      badgeText = 'HỒ SƠ / PHẢN ÁNH MỚI';
      badgeBg = '#d97706'; // amber-600
    }

    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #065f46 0%, #0f766e 100%); padding: 24px; text-align: center; border-bottom: 3px solid #10b981; }
        .logo-title { font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: 1px; margin: 0; }
        .logo-subtitle { font-size: 11px; color: #a7f3d0; text-transform: uppercase; margin-top: 4px; }
        .body { padding: 30px 24px; }
        .badge { display: inline-block; padding: 6px 12px; font-size: 11px; font-weight: 700; color: #ffffff; background-color: ${badgeBg}; border-radius: 20px; text-transform: uppercase; margin-bottom: 16px; }
        .title { font-size: 18px; font-weight: 700; color: #f8fafc; margin: 0 0 12px 0; }
        .greeting { font-size: 14px; color: #94a3b8; margin-bottom: 16px; }
        .content-box { background-color: #0f172a; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 24px; }
        .btn-wrapper { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; padding: 12px 28px; background: linear-gradient(90deg, #10b981, #0d9488); color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
        .footer { background-color: #0f172a; padding: 20px; text-align: center; border-top: 1px solid #334155; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-title">BAN QUẢN LÝ KHU DỰ TRỮ SINH QUYỂN MÔI TRƯỜNG MBS</div>
          <div class="logo-subtitle">CỔNG THÔNG TIN ĐIỆN TỬ & DỊCH VỤ CÔNG TRỰC TUYẾN</div>
        </div>
        <div class="body">
          <span class="badge">${badgeText}</span>
          <h2 class="title">${title}</h2>
          <p class="greeting">Kính gửi Đồng chí <strong>${toName}</strong>,</p>
          <div class="content-box">
            ${content}
          </div>
          <div class="btn-wrapper">
            <a href="${actionUrl}" class="btn" target="_blank">TRUY CẬP HỆ THỐNG XỬ LÝ</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${currentYear} Ban Quản lý MBS TP.Hồ Chí Minh. Tất cả các quyền được bảo lưu.</p>
          <p>Email này được gửi tự động từ hệ thống Admin CMS. Vui lòng không trả lời trực tiếp email này.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Dispatches email notification to specified account
   */
  static async sendEmail(payload: SendEmailPayload): Promise<boolean> {
    try {
      const htmlContent = this.generateHtmlTemplate(payload);

      // Log email delivery to console in development mode
      console.log(`====================================================`);
      console.log(`📧 [AUTOMATED EMAIL DISPATCHER] -> Sending Email to: ${payload.toName} <${payload.toEmail}>`);
      console.log(`📌 Subject: [MBS PORTAL] ${payload.title}`);
      console.log(`🔗 Target URL: http://localhost:3000/#${payload.linkUrl || '/admin/dashboard'}`);
      console.log(`====================================================`);

      return true;
    } catch (err) {
      console.error('Failed to send email notification:', err);
      return false;
    }
  }
}
