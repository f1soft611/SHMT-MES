import { theme } from './theme';

describe('Font Configuration', () => {
  test('Pretendard GOV font is configured as primary font family', () => {
    expect(theme.typography?.fontFamily).toContain('Pretendard GOV');
  });

  test('fallback fonts are properly configured', () => {
    const fontFamily = theme.typography?.fontFamily as string;
    expect(fontFamily).toContain('Pretendard');
    expect(fontFamily).toContain('-apple-system');
    expect(fontFamily).toContain('BlinkMacSystemFont');
    expect(fontFamily).toContain('Roboto');
    expect(fontFamily).toContain('sans-serif');
  });

  test('theme maintains existing typography settings', () => {
    expect(theme.typography?.h4?.fontWeight).toBe(600);
    expect(theme.typography?.h5?.fontWeight).toBe(600);
    expect(theme.typography?.h6?.fontWeight).toBe(600);
  });

  test('theme has not broken existing components', () => {
    expect(theme.components?.MuiButton?.styleOverrides?.root?.textTransform).toBe('none');
    expect(theme.components?.MuiCard?.styleOverrides?.root?.boxShadow).toBeDefined();
  });
});