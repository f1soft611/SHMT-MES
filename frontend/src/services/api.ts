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

// 토큰 만료 확인 함수
const isTokenExpiringSoon = (): boolean => {
  const issuedAt = sessionStorage.getItem('tokenIssuedAt');
  if (!issuedAt) {
    return true;
  }

  const tokenAge = Date.now() - parseInt(issuedAt);
  // 토큰이 발급된 지 55분(3300초) 이상 경과했으면 갱신 필요
  const TOKEN_VALIDITY = 60 * 60 * 1000; // 60분
  const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5분
  return tokenAge >= (TOKEN_VALIDITY - TOKEN_REFRESH_THRESHOLD);
};

// 토큰 갱신 함수
const performTokenRefresh = async (): Promise<string | null> => {
  const refreshToken = sessionStorage.getItem('refreshToken');
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken: refreshToken
    });

    if (response.data.resultCode === '200' && response.data.jToken) {
      const newToken = response.data.jToken;
      sessionStorage.setItem('accessToken', newToken);
      sessionStorage.setItem('tokenIssuedAt', Date.now().toString());
      return newToken;
    }
    return null;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    return null;
  }
};

// 요청 인터셉터
apiClient.interceptors.request.use(
  async (config) => {
    // 인증 토큰이 있다면 추가
    let token = sessionStorage.getItem('accessToken');
    if (token) {
      // 요청 전에 토큰 만료 확인 및 자동 갱신
      if (isTokenExpiringSoon()) {
        console.log('요청 전 토큰 자동 갱신...');
        const newToken = await performTokenRefresh();
        if (newToken) {
          token = newToken;
        }
      }
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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

// 응답 인터셉터
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
      
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: refreshToken
          });
          
          if (refreshResponse.data.resultCode === '200' && refreshResponse.data.jToken) {
            const newToken = refreshResponse.data.jToken;
            sessionStorage.setItem('accessToken', newToken);
            originalRequest.headers.Authorization = newToken;
            processQueue(null, newToken);
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          console.error('토큰 리프레쉬 실패:', refreshError);
          processQueue(refreshError, null);
        } finally {
          isRefreshing = false;
        }
      }
      
      // 리프레쉬 실패 시 로그인 페이지로 리다이렉트
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
