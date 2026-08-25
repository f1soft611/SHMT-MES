export type DirectItemMetaInput = {
  itemCode?: string;
  itemName?: string;
  itemInputType?: 'DIRECT' | 'NORMAL';
  directGroupId?: string;
  createDays?: number;
  orderNo?: string;
};

export type DirectItemMeta = {
  itemInputType: 'DIRECT' | 'NORMAL';
  directGroupId?: string;
};

const sanitizeToken = (value?: string, fallback = 'DIRECT'): string => {
  const clean = (value ?? fallback)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 12);

  return clean || fallback;
};

export const buildDirectGroupId = (
  baseDate: string,
  itemCode?: string,
  itemName?: string,
): string => {
  const datePart = (baseDate || new Date().toISOString().slice(0, 10))
    .replace(/-/g, '')
    .slice(-8);
  const itemPart = sanitizeToken(itemCode || itemName || 'DIRECT', 'DIRECT');
  return `DG-${datePart}-${itemPart}`;
};

export const resolveDirectItemMeta = (
  input: DirectItemMetaInput,
): DirectItemMeta => {
  const isDirect = input.itemInputType === 'DIRECT';

  if (!isDirect) {
    return {
      itemInputType: 'NORMAL',
      directGroupId: undefined,
    };
  }

  const directGroupId =
    input.directGroupId ||
    buildDirectGroupId(
      new Date().toISOString().slice(0, 10),
      input.itemCode,
      input.itemName,
    );

  return {
    itemInputType: 'DIRECT',
    directGroupId,
  };
};
