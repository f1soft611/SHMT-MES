import {
  getUniformGroupColor,
  shouldUpdateScrollMetrics,
} from './weeklyGridPerformance';

describe('weeklyGridPerformance', () => {
  it('returns false when scroll metrics are unchanged', () => {
    expect(shouldUpdateScrollMetrics(1000, 600, 1000, 600)).toBe(false);
  });

  it('returns true when scroll metrics changed', () => {
    expect(shouldUpdateScrollMetrics(1000, 600, 1200, 600)).toBe(true);
    expect(shouldUpdateScrollMetrics(1000, 600, 1000, 640)).toBe(true);
  });

  it('returns a uniform group color with stable reference', () => {
    const first = getUniformGroupColor('group-a');
    const second = getUniformGroupColor('group-b');

    expect(first).toBe(second);
    expect(first).toEqual({
      main: '#0f766e',
      light: '#e6fffb',
      dark: '#0b5a53',
    });
  });
});
