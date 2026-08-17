export function validateFeedbackForm(data: {
  senderName?: string;
  senderPhone?: string;
  senderEmail?: string;
  title?: string;
  description?: string;
}) {
  const errors: Record<string, string> = {};

  if (!data.senderName || !data.senderName.trim()) {
    errors.senderName = 'Họ và tên không được để trống.';
  }

  if (!data.senderPhone || !/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(data.senderPhone.trim())) {
    errors.senderPhone = 'Số điện thoại không hợp lệ (10 chữ số).';
  }

  if (data.senderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.senderEmail.trim())) {
    errors.senderEmail = 'Địa chỉ email không đúng định dạng.';
  }

  if (!data.title || data.title.trim().length < 5) {
    errors.title = 'Tiêu đề phản ánh phải có ít nhất 5 ký tự.';
  }

  if (!data.description || data.description.trim().length < 15) {
    errors.description = 'Nội dung phản ánh chi tiết phải từ 15 ký tự trở lên.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
