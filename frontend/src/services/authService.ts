import axios from 'axios';

// 환경 변수에서 API 기본 URL 가져오기
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || '10000');

export interface LoginRequest {
  id: string;
  password: string;
}

export interface LoginResponse {
  resultVO: {
    id: string;
    name: string;
    userSe: string;
    groupNm: string;
    uniqId?: string;
    orgnztId?: string;
  };
  jToken: string;
  resultCode: string;
  resultMessage: string;
}

// axios 인스턴스 생성 (권장)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      if (
        credentials.id.trim() === 'admin' &&
        credentials.password.trim() === 'f1soft@611'
      ) {
        // 테스트용 하드코딩된 로그인 정보
        const response: LoginResponse = {
          resultVO: {
            id: 'admin',
            name: '관리자',
            userSe: 'ADMIN',
            groupNm: '운영팀',
            uniqId: '12345',
            orgnztId: 'org-001',
          },
          jToken: 'test-jwt-token',
          resultCode: '200',
          resultMessage: '로그인 성공',
        };
        sessionStorage.setItem('accessToken', response.jToken);
        sessionStorage.setItem('user', JSON.stringify(response.resultVO));
        console.log('하드코딩된 로그인 정보로 로그인 성공:', response);

        return response;
      }

      const response = await apiClient.post<LoginResponse>(
        '/auth/login-jwt',
        credentials
      );

      if (response.data.resultCode === '200' && response.data.jToken) {
        // JWT 토큰을 sessionStorage에 저장
        sessionStorage.setItem('accessToken', response.data.jToken);
        sessionStorage.setItem('user', JSON.stringify(response.data.resultVO));
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `인증 실패: ${error.response?.data?.resultMessage || error.message}`
        );
      }
      throw new Error('로그인 요청 중 오류가 발생했습니다.');
    }
  },

  logout() {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
  },

  getToken(): string | null {
    return sessionStorage.getItem('accessToken');
  },

  getUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // API 기본 URL 확인용 메서드 (디버깅용)
  getApiBaseUrl(): string {
    return API_BASE_URL;
  },
};

// Request interceptor - 자동으로 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 에러 시 자동 로그아웃
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
