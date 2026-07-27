import { ProcessFlowProcessDraft } from '../types';

export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateProcessDraft(
  rows: ProcessFlowProcessDraft[],
): ValidationResult {
  if (rows.length < 1 || rows.length > 5) {
    return { ok: false, message: '공정은 1개 이상 5개 이하로 등록해야 합니다.' };
  }

  const seqs = rows.map((row) => row.seq);
  if (seqs.some((seq) => !Number.isInteger(seq) || Number(seq) <= 0)) {
    return { ok: false, message: '공정 순번은 양의 정수여야 합니다.' };
  }

  if (new Set(seqs).size !== seqs.length) {
    return { ok: false, message: '공정 순번은 중복될 수 없습니다.' };
  }

  if (rows.filter((row) => row.planFlag === 'Y').length !== 1) {
    return { ok: false, message: '계획 공정을 1개 선택해야 합니다.' };
  }

  return { ok: true };
}
