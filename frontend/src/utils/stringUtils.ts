export const decodeHtml = (str?: string | null): string => {
    if (!str) return '';

    return str
    .replace(/&Prime;/g, '″')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
};
