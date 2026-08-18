/**
 * Sanitizes HTML content from Rich Text Editor before saving to Database
 * Strip dangerous script tags, inline event handlers, javascript: URIs to prevent XSS attacks.
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html) return '';
  
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/on\w+=\w+/gi, '')
    .replace(/href="javascript:[^"]*"/gi, 'href="#"')
    .replace(/src="javascript:[^"]*"/gi, 'src=""')
    .replace(/<iframe>(.*?)<\/iframe>/gi, '');
}
