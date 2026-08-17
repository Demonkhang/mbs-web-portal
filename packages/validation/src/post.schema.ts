export interface PostValidationRules {
  title: { minLength: number; maxLength: number };
  summary: { minLength: number; maxLength: number };
  content: { minLength: number };
}

export const postValidationRules: PostValidationRules = {
  title: { minLength: 5, maxLength: 255 },
  summary: { minLength: 10, maxLength: 500 },
  content: { minLength: 20 },
};

export function validatePost(data: Record<string, any>) {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length < postValidationRules.title.minLength) {
    errors.title = `Tiêu đề phải có ít nhất ${postValidationRules.title.minLength} ký tự.`;
  }
  if (!data.summary || data.summary.trim().length < postValidationRules.summary.minLength) {
    errors.summary = `Tóm tắt phải có ít nhất ${postValidationRules.summary.minLength} ký tự.`;
  }
  if (!data.content || data.content.trim().length < postValidationRules.content.minLength) {
    errors.content = `Nội dung phải có ít nhất ${postValidationRules.content.minLength} ký tự.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
