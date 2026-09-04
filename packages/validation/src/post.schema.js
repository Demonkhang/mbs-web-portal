export const postValidationRules = {
    title: { minLength: 5, maxLength: 255 },
    summary: { minLength: 10, maxLength: 500 },
    content: { minLength: 20 },
};
export function validatePost(data) {
    const errors = {};
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
