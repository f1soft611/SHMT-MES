import axios from 'axios';

// 환경 변수에서 API 기본 URL 가져오기
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || '10000');

// 토큰 만료 5분 전에 갱신 (밀리초)
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000;

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
  loginHistoryId?: number;
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
  decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }

      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const normalized = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const decoded = atob(normalized);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  },

  getTokenExpirationTime(token: string): number | null {
    const payload = this.decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== 'number') {
      return null;
    }

    return payload.exp * 1000;
  },

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        '/auth/login-jwt',
        credentials,
      );

      if (response.data.resultCode === '200' && response.data.jToken) {
        // JWT 토큰을 sessionStorage에 저장
        sessionStorage.setItem('accessToken', response.data.jToken);
        sessionStorage.setItem('refreshToken', response.data.refreshToken);
        sessionStorage.setItem('user', JSON.stringify(response.data.resultVO));
        // 토큰 발급 시간 저장 (밀리초)
        sessionStorage.setItem('tokenIssuedAt', Date.now().toString());
        // 로그인 이력 ID 저장 (로그아웃 시 사용)
        if (response.data.loginHistoryId) {
          sessionStorage.setItem(
            'loginHistoryId',
            response.data.loginHistoryId.toString(),
          );
        }

        // 자동 갱신 타이머 시작
        // this.startTokenRefreshTimer();
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `인증 실패: ${error.response?.data?.resultMessage || error.message}`,
        );
      }
      throw new Error('로그인 요청 중 오류가 발생했습니다.');
    }
  },

  async logout() {
    try {
      const loginHistoryId = sessionStorage.getItem('loginHistoryId');
      // 백엔드 로그아웃 호출로 서버측 세션/이력 업데이트 수행
      await apiClient.post('/auth/logout', {
        loginHistoryId: loginHistoryId ? parseInt(loginHistoryId) : null,
      });
    } catch (e) {
      console.warn('백엔드 로그아웃 호출 실패, 클라이언트만 정리합니다.', e);
    }
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('tokenIssuedAt');
    sessionStorage.removeItem('loginHistoryId');
    // this.stopTokenRefreshTimer();
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

  // 토큰 만료 여부 확인 (JWT exp 기준, 임계값 5분)
  // exp 파싱이 불가능할 때만 tokenIssuedAt 기반으로 폴백합니다.
  isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    const expirationTime = this.getTokenExpirationTime(token);
    if (expirationTime) {
      return expirationTime - Date.now() <= TOKEN_REFRESH_THRESHOLD;
    }

    const issuedAt = sessionStorage.getItem('tokenIssuedAt');
    if (!issuedAt) {
      return true;
    }

    const tokenAge = Date.now() - parseInt(issuedAt);
    // 토큰이 발급된 지 55분(3300초) 이상 경과했으면 갱신 필요
    const TOKEN_VALIDITY = 60 * 60 * 1000; // 60분
    return tokenAge >= TOKEN_VALIDITY - TOKEN_REFRESH_THRESHOLD;
  },

  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await apiClient.post('/auth/refresh', {
        refreshToken: refreshToken,
      });

      if (response.data.resultCode === '200' && response.data.jToken) {
        sessionStorage.setItem('accessToken', response.data.jToken);
        // 새 토큰 발급 시간 업데이트
        sessionStorage.setItem('tokenIssuedAt', Date.now().toString());
        return response.data.jToken;
      }
      return null;
    } catch (error) {
      console.error('토큰 리프레쉬 실패:', error);
      await this.logout();
      return null;
    }
  },

  // 주기적으로 토큰 갱신 확인하는 타이머
  refreshTimerId: null as NodeJS.Timeout | null,

  startTokenRefreshTimer() {
    // 기존 타이머가 있으면 중지
    this.stopTokenRefreshTimer();

    // 1분마다 토큰 만료 확인 및 자동 갱신
    this.refreshTimerId = setInterval(async () => {
      if (this.isAuthenticated() && this.isTokenExpiringSoon()) {
        console.log('토큰 자동 갱신 시작...');
        await this.refreshToken();
      }
    }, 60 * 1000); // 1분마다 확인
  },

  stopTokenRefreshTimer() {
    if (this.refreshTimerId) {
      clearInterval(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  },

  // API 기본 URL 확인용 메서드 (디버깅용)
  getApiBaseUrl(): string {
    return API_BASE_URL;
  },
};
