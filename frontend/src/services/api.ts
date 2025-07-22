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
  (config) => {
    // 인증 토큰이 있다면 추가
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 오류 시 로그인 페이지로 리다이렉트
      // sessionStorage.removeItem('accessToken');
      // sessionStorage.removeItem('user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
