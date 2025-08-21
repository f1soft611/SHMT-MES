import apiClient from '../api';

export interface User {
  uniqId: string;
  mberId: string;
  mberNm: string;
  mberSttus: string;
  sbscrbDe?: string;
  password?: string;
  passwordHint?: string;
  passwordCnsr?: string;
  adres?: string;
  detailAdres?: string;
  areaNo?: string;
  middleTelno?: string;
  endTelno?: string;
  moblphonNo?: string;
  mberFxnum?: string;
  ihidnum?: string;
  sexdstnCode?: string;
  orgnztId?: string;
  groupId?: string;
  email?: string;
  userTy?: string;
  frstRegistPnttm?: Date;
  frstRegisterId?: string;
  lastUpdtPnttm?: Date;
  lastUpdusrId?: string;
}

export interface UserSearchParams {
  pageIndex?: number;
  searchCnd?: string;
  searchWrd?: string;
  pageUnit?: number;
  pageSize?: number;
}

export interface UserListResponse {
  resultList: User[];
  paginationInfo: {
    currentPageNo: number;
    recordCountPerPage: number;
    pageSize: number;
    totalRecordCount: number;
    firstRecordIndex: number;
    lastRecordIndex: number;
  };
  mberSttus_result: Array<{ code: string; codeNm: string }>;
  sexdstnCode_result: Array<{ code: string; codeNm: string }>;
  passwordHint_result: Array<{ code: string; codeNm: string }>;
  groupId_result: Array<{ code: string; codeNm: string }>;
}

export interface UserFormData {
  mberId: string;
  mberNm: string;
  password: string;
  passwordHint: string;
  passwordCnsr: string;
  mberSttus: string;
  sexdstnCode?: string;
  adres?: string;
  detailAdres?: string;
  areaNo?: string;
  middleTelno?: string;
  endTelno?: string;
  moblphonNo?: string;
  mberFxnum?: string;
  ihidnum?: string;
  groupId?: string;
  email?: string;
}

class UserService {
  /**
   * 사용자 목록을 조회한다
   */
  async getUsers(searchParams?: UserSearchParams): Promise<UserListResponse> {
    const params = new URLSearchParams();
    
    if (searchParams?.pageIndex) {
      params.append('pageIndex', searchParams.pageIndex.toString());
    }
    if (searchParams?.searchCnd) {
      params.append('searchCnd', searchParams.searchCnd);
    }
    if (searchParams?.searchWrd) {
      params.append('searchWrd', searchParams.searchWrd);
    }

    const response = await apiClient.get(`/api/members?${params.toString()}`);
    return response.data.result;
  }

  /**
   * 사용자 상세정보를 조회한다
   */
  async getUserDetail(uniqId: string): Promise<User> {
    const response = await apiClient.get(`/api/members/update/${uniqId}`);
    return response.data.result.mberManageVO;
  }

  /**
   * 사용자 등록 시 필요한 코드 정보를 조회한다
   */
  async getUserFormData(): Promise<{
    passwordHint_result: Array<{ code: string; codeNm: string }>;
    sexdstnCode_result: Array<{ code: string; codeNm: string }>;
    mberSttus_result: Array<{ code: string; codeNm: string }>;
    groupId_result: Array<{ code: string; codeNm: string }>;
  }> {
    const response = await apiClient.get('/api/members/insert');
    return response.data.result;
  }

  /**
   * 사용자를 등록한다
   */
  async createUser(userData: UserFormData): Promise<void> {
    await apiClient.post('/api/members/insert', userData);
  }

  /**
   * 사용자 정보를 수정한다
   */
  async updateUser(userData: UserFormData & { uniqId: string }): Promise<void> {
    await apiClient.put('/api/members/update', userData);
  }

  /**
   * 사용자를 삭제한다
   */
  async deleteUser(uniqId: string): Promise<void> {
    await apiClient.delete(`/api/members/delete/${uniqId}`);
  }

  /**
   * 사용자 ID 중복을 확인한다
   */
  async checkUserId(mberId: string): Promise<{ usableAt: string }> {
    const response = await apiClient.get(`/api/etc/member_checkid/${mberId}`);
    return response.data.result;
  }
}

export const userService = new UserService();