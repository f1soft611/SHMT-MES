import axios from 'axios';

// 환경 변수에서 API 기본 URL 가져오기
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || '10000');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  async (config) => {
    // 인증 토큰이 있다면 추가
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    // 성공적인 응답 시 활동 시간 업데이트 (슬라이딩 윈도우 세션)
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      sessionStorage.setItem('tokenIssuedAt', Date.now().toString());
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 발생 시에만 토큰 갱신 시도
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

      const refreshToken = sessionStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {
              refreshToken: refreshToken,
            }
          );

          if (
            refreshResponse.data.resultCode === '200' &&
            refreshResponse.data.jToken
          ) {
            const newToken = refreshResponse.data.jToken;
            sessionStorage.setItem('accessToken', newToken);
            sessionStorage.setItem('tokenIssuedAt', Date.now().toString());
            originalRequest.headers.Authorization = newToken;
            processQueue(null, newToken);
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          console.error('토큰 리프레쉬 실패:', refreshError);
          processQueue(refreshError, null);
          // 리프레쉬 실패 시 로그인 페이지로 리다이렉트
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('tokenIssuedAt');
          window.location.href = '/login';
        } finally {
          isRefreshing = false;
        }
      } else {
        // refreshToken이 없으면 로그인 페이지로
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('tokenIssuedAt');
        window.location.href = '/login';
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
