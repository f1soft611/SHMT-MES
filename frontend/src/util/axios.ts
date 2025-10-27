import axios from 'axios';
import { authService } from '../services/authService';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
});

// 토큰 리프레쉬 중인지 추적하는 변수
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

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

// 요청 인터셉터: JWT 토큰 자동 첨부 및 만료 확인
apiClient.interceptors.request.use(
  async (config) => {
    const token = authService.getToken();
    if (token) {
      // 요청 전에 토큰 만료 확인 및 자동 갱신
      if (authService.isTokenExpiringSoon()) {
        console.log('요청 전 토큰 자동 갱신...');
        const newToken = await authService.refreshToken();
        if (newToken) {
          config.headers.Authorization = newToken;
        } else {
          config.headers.Authorization = token;
        }
      } else {
        config.headers.Authorization = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 시 토큰 리프레쉬 시도
apiClient.interceptors.response.use(
  (response) => {
    // 성공적인 응답 시 활동 시간 업데이트 (슬라이딩 윈도우 세션)
    // 사용자가 활동 중일 때마다 세션을 연장합니다
    const token = authService.getToken();
    if (token) {
      sessionStorage.setItem('tokenIssuedAt', Date.now().toString());
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 리프레쉬 중이면 큐에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const newToken = await authService.refreshToken();
      if (newToken) {
        originalRequest.headers.Authorization = newToken;
        processQueue(null, newToken);
        isRefreshing = false;
        return apiClient(originalRequest);
      } else {
        processQueue(error, null);
        isRefreshing = false;
        // 리프레쉬 실패 시 로그아웃 및 로그인 페이지로 이동
        authService.logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
