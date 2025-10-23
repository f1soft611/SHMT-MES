import api from './api';

export interface SchedulerConfig {
  schedulerId?: number;
  schedulerName: string;
  schedulerDescription?: string;
  cronExpression: string;
  jobClassName: string;
  isEnabled: string;
  createdDate?: string;
  createdBy?: string;
  updatedDate?: string;
  updatedBy?: string;
}

export interface SchedulerHistory {
  historyId?: number;
  schedulerId: number;
  schedulerName: string;
  startTime: string;
  endTime?: string;
  status: string;
  errorMessage?: string;
  executionTimeMs?: number;
  createdDate?: string;
}

export interface SchedulerListResponse {
  result: {
    resultList: SchedulerConfig[];
    resultCnt: string;
    paginationInfo: {
      currentPageNo: number;
      recordCountPerPage: number;
      pageSize: number;
      totalRecordCount: number;
    };
  };
  resultCode: number;
  resultMessage: string;
}

export interface SchedulerHistoryListResponse {
  result: {
    resultList: SchedulerHistory[];
    resultCnt: string;
    paginationInfo: {
      currentPageNo: number;
      recordCountPerPage: number;
      pageSize: number;
      totalRecordCount: number;
    };
  };
  resultCode: number;
  resultMessage: string;
}

export interface SchedulerDetailResponse {
  result: {
    scheduler: SchedulerConfig;
  };
  resultCode: number;
  resultMessage: string;
}

export interface SchedulerHistoryDetailResponse {
  result: {
    history: SchedulerHistory;
  };
  resultCode: number;
  resultMessage: string;
}

class SchedulerService {
  // 스케쥴러 목록 조회
  async getSchedulerList(
    page: number = 0,
    pageSize: number = 10,
    searchWrd: string = '',
    isEnabled?: string
  ): Promise<SchedulerListResponse> {
    const params: any = {
      pageIndex: page + 1,
      pageUnit: pageSize,
    };

    if (searchWrd) {
      params.searchWrd = searchWrd;
    }

    if (isEnabled) {
      params.isEnabled = isEnabled;
    }

    const response = await api.get('/api/schedulers', { params });
    return response.data;
  }

  // 스케쥴러 상세 조회
  async getSchedulerDetail(schedulerId: number): Promise<SchedulerDetailResponse> {
    const response = await api.get(`/api/schedulers/${schedulerId}`);
    return response.data;
  }

  // 스케쥴러 등록
  async createScheduler(scheduler: SchedulerConfig): Promise<any> {
    const response = await api.post('/api/schedulers', scheduler);
    return response.data;
  }

  // 스케쥴러 수정
  async updateScheduler(
    schedulerId: number,
    scheduler: SchedulerConfig
  ): Promise<any> {
    const response = await api.put(`/api/schedulers/${schedulerId}`, scheduler);
    return response.data;
  }

  // 스케쥴러 삭제
  async deleteScheduler(schedulerId: number): Promise<any> {
    const response = await api.delete(`/api/schedulers/${schedulerId}`);
    return response.data;
  }

  // 스케쥴러 재시작
  async restartSchedulers(): Promise<any> {
    const response = await api.post('/api/schedulers/restart');
    return response.data;
  }

  // 스케쥴러 실행 이력 목록 조회
  async getSchedulerHistoryList(
    page: number = 0,
    pageSize: number = 10,
    searchWrd: string = '',
    schedulerId?: number,
    status?: string
  ): Promise<SchedulerHistoryListResponse> {
    const params: any = {
      pageIndex: page + 1,
      pageUnit: pageSize,
    };

    if (searchWrd) {
      params.searchWrd = searchWrd;
    }

    if (schedulerId) {
      params.schedulerId = schedulerId;
    }

    if (status) {
      params.status = status;
    }

    const response = await api.get('/api/scheduler-history', { params });
    return response.data;
  }

  // 스케쥴러 실행 이력 상세 조회
  async getSchedulerHistoryDetail(
    historyId: number
  ): Promise<SchedulerHistoryDetailResponse> {
    const response = await api.get(`/api/scheduler-history/${historyId}`);
    return response.data;
  }
}

export const schedulerService = new SchedulerService();
