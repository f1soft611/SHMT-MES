import {
  getUniformGroupColor,
  shouldUseEquipmentRowVirtualization,
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

  it('uses virtualization only for large collapsed equipment lists', () => {
    expect(shouldUseEquipmentRowVirtualization(40, 0)).toBe(true);
    expect(shouldUseEquipmentRowVirtualization(120, 0)).toBe(true);
    expect(shouldUseEquipmentRowVirtualization(39, 0)).toBe(false);
    expect(shouldUseEquipmentRowVirtualization(120, 1)).toBe(false);
  });
});
