/**
 * 공통코드 관련 타입 정의
 */

export interface CommonCode {
  codeId: string;
  codeIdNm: string;
  codeIdDc?: string;
  clCode?: string | 'LET';
  useAt: string;
}

export interface CommonDetailCode {
  codeId: string;
  code: string;
  codeNm: string;
  codeDc?: string;
  useAt: string;
}

export interface CommonCodeSearchParams {
  searchCnd?: string;
  searchWrd?: string;
  useAt?: string;
  clCode?: string;
}
