/**
 * 작업장 관련 타입 정의
 */

export interface Workplace {
  workplaceId?: string;
  workplaceCode: string;
  workplaceName: string;
  description?: string;
  location?: string;
  workplaceType?: string;
  status?: string;
  useYn?: string;
  regUserId?: string;
  regDt?: string;
  updUserId?: string;
  updDt?: string;
}

export interface WorkplaceWorker {
  workplaceWorkerId?: string;
  workplaceId: string;
  workerId: string;
  workerName: string;
  position?: string;
  role?: string;
  useYn?: string;
  regUserId?: string;
  regDt?: string;
  updUserId?: string;
  updDt?: string;
}

export interface WorkplaceSearchParams {
  searchCnd?: string;
  searchWrd?: string;
  status?: string;
  useYn?: string;
  pageIndex?: number;
}
