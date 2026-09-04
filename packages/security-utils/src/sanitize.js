/**
 * Simple HTML Sanitizer helper to prevent XSS injection.
 */
export function sanitizeHtml(dirtyHtml) {
    if (!dirtyHtml)
        return '';
    return dirtyHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:[^"]*/gi, '');
}
/**
 * Text sanitizer for plain string inputs.
 */
export function sanitizeString(input) {
    if (!input)
        return '';
    return input.trim().replace(/[<>]/g, '');
}
