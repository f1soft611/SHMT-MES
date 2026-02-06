export const decodeHtml = (str: string = ''): string =>
    str
    .replace(/&Prime;/g, '″')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');