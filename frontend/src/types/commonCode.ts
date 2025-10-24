/**
 * 공통코드 관련 타입 정의
 */

export interface CommonCode {
  codeId: string;
  codeIdNm: string;
  codeIdDc?: string;
  useAt?: string;
  clCode?: string;
  frstRegistPnttm?: string;
  frstRegisterId?: string;
  lastUpdtPnttm?: string;
  lastUpdusrId?: string;
}

export interface CommonCodeSearchParams {
  searchCnd?: string;
  searchWrd?: string;
  useAt?: string;
  clCode?: string;
  pageIndex?: number;
}

export interface CommonDetailCode {
  codeId: string;
  code: string;
  codeNm: string;
  codeDc?: string;
  useAt?: string;
  frstRegistPnttm?: string;
  frstRegisterId?: string;
  lastUpdtPnttm?: string;
  lastUpdusrId?: string;
}
