import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { authService, LoginRequest } from '../services/authService';

interface User {
  id: string;
  name: string;
  userSe: string;
  groupNm: string;
  groupId?: string; // Add groupId for permission system
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 앱 시작 시 저장된 사용자 정보 확인
    const savedUser = authService.getUser();
    const token = authService.getToken();

    if (savedUser && token) {
      setUser(savedUser);
      // 로그인된 상태면 자동 갱신 타이머 시작
      // authService.startTokenRefreshTimer();
    }

    setLoading(false);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      authService.stopTokenRefreshTimer();
    };
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);

      if (response.resultCode === '200') {
        setUser(response.resultVO);
      } else {
        throw new Error(response.resultMessage || '로그인에 실패했습니다.');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
