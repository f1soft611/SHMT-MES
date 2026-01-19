import apiClient from './api';

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface PasswordChangeResponse {
  resultCode: number;
  resultMessage: string;
  result?: {
    error?: string;
  };
}

/**
 * 비밀번호 변경 서비스
 */
export const passwordService = {
  /**
   * 현재 로그인한 사용자의 비밀번호를 변경한다
   * @param old_password - 현재 비밀번호
   * @param new_password - 새 비밀번호
   */
  async changePassword(
    old_password: string,
    new_password: string,
  ): Promise<PasswordChangeResponse> {
    try {
      console.log('비밀번호 변경 요청 시작');
      const response = await apiClient.patch<PasswordChangeResponse>(
        '/members/password',
        {
          old_password,
          new_password,
        },
      );
      console.log('비밀번호 변경 응답:', response);
      return response.data;
    } catch (error: any) {
      console.error('비밀번호 변경 에러:', error);
      console.error('에러 상태 코드:', error.response?.status);
      console.error('에러 데이터:', error.response?.data);
      throw error;
    }
  },
};
