import React from 'react';
import { theme } from './styles/theme';

test('Pretendard GOV font is properly configured in theme', () => {
  expect(theme.typography?.fontFamily).toContain('Pretendard GOV');
  expect(theme.typography?.fontFamily).toContain('Pretendard');
  expect(theme.typography?.fontFamily).toContain('sans-serif');
});

test('theme has required properties', () => {
  expect(theme.palette).toBeDefined();
  expect(theme.typography).toBeDefined();
  expect(theme.components).toBeDefined();
});
