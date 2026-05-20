export type GroupColor = {
  main: string;
  light: string;
  dark: string;
};

const UNIFORM_GROUP_COLOR: GroupColor = {
  main: '#0f766e',
  light: '#e6fffb',
  dark: '#0b5a53',
};

export const getUniformGroupColor = (_groupId: string): GroupColor => {
  return UNIFORM_GROUP_COLOR;
};

export const shouldUpdateScrollMetrics = (
  prevScrollWidth: number,
  prevClientWidth: number,
  nextScrollWidth: number,
  nextClientWidth: number,
): boolean => {
  return (
    prevScrollWidth !== nextScrollWidth || prevClientWidth !== nextClientWidth
  );
};

export const shouldUseEquipmentRowVirtualization = (
  equipmentCount: number,
  expandedCount: number,
): boolean => {
  return equipmentCount >= 40 && expandedCount === 0;
};
