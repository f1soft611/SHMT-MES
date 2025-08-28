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
  refreshToken: string;
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
      const response = await apiClient.post<LoginResponse>(
        '/auth/login-jwt',
        credentials
      );

      if (response.data.resultCode === '200' && response.data.jToken) {
        // JWT 토큰을 sessionStorage에 저장
        sessionStorage.setItem('accessToken', response.data.jToken);
        sessionStorage.setItem('refreshToken', response.data.refreshToken);
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
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
  },

  getToken(): string | null {
    return sessionStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return sessionStorage.getItem('refreshToken');
  },

  getUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await apiClient.post('/auth/refresh', {
        refreshToken: refreshToken
      });

      if (response.data.resultCode === '200' && response.data.jToken) {
        sessionStorage.setItem('accessToken', response.data.jToken);
        return response.data.jToken;
      }
      return null;
    } catch (error) {
      console.error('토큰 리프레쉬 실패:', error);
      this.logout();
      return null;
    }
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

// 토큰 리프레쉬 중인지 추적하는 변수
let isRefreshing = false;
let failedQueue: Array<{resolve: Function, reject: Function}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor - 401 에러 시 토큰 리프레쉬 시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 리프레쉬 중이면 큐에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      const newToken = await authService.refreshToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        isRefreshing = false;
        return apiClient(originalRequest);
      } else {
        processQueue(error, null);
        isRefreshing = false;
        // 리프레쉬 실패 시 로그인 페이지로 이동
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
