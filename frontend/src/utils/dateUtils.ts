/**
 * 서버 시간 동기화 유틸리티
 *
 * 클라이언트와 서버 시간의 차이를 계산하여 저장하고,
 * 서버 기준의 현재 시간을 제공합니다.
 *
 * @author SHMT-MES
 * @since 2026.01.20
 * @version 1.0
 */

import api from '../util/axios';

/**
 * 서버 시간과 클라이언트 시간의 차이 (밀리초)
 * null인 경우 아직 동기화되지 않은 상태
 */
let serverTimeOffset: number | null = null;

/**
 * 동기화 상태
 */
let isSyncing = false;
let lastSyncTime: number | null = null;
let lastFailedSyncTime: number | null = null;
let syncRetryCount = 0;

/**
 * 재시도 설정
 */
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 5000; // 5초

/**
 * 서버 시간 API 응답 타입
 */
interface ServerTimeResponse {
  serverTime: number;
  serverDate: string;
  serverDateTime: string;
  serverISODateTime: string;
}

/**
 * 서버 시간과 클라이언트 시간의 차이를 계산하여 저장
 *
 * @returns Promise<void>
 * @throws Error 서버 시간 동기화 실패 시
 *
 * @example
 * ```typescript
 * // App 초기화 시 호출
 * await syncServerTime();
 *
 * // 주기적으로 재동기화 (1시간마다)
 * setInterval(syncServerTime, 3600000);
 * ```
 */
export const syncServerTime = async (): Promise<void> => {
  // 이미 동기화 중이면 중복 실행 방지
  if (isSyncing) {
    // console.log('서버 시간 동기화가 이미 진행 중입니다.');
    return;
  }

  // 최근에 실패했다면 일정 시간 동안 재시도하지 않음
  if (lastFailedSyncTime) {
    const timeSinceLastFailure = Date.now() - lastFailedSyncTime;
    if (timeSinceLastFailure < RETRY_DELAY) {
      // console.log(
      //   `서버 시간 동기화 재시도 대기 중... (${Math.ceil((RETRY_DELAY - timeSinceLastFailure) / 1000)}초 후 재시도 가능)`,
      // );
      return;
    }
  }

  // 재시도 횟수 제한 체크
  if (syncRetryCount >= MAX_RETRY_COUNT) {
    console.warn(
      `서버 시간 동기화 재시도 횟수 초과 (${MAX_RETRY_COUNT}회). 클라이언트 시간을 사용합니다.`,
    );
    serverTimeOffset = 0;
    return;
  }

  try {
    isSyncing = true;

    // 요청 직전의 클라이언트 시간
    const clientTimeBeforeRequest = Date.now();

    const response = await api.get<{ result: ServerTimeResponse }>(
      '/api/system/server-time',
    );

    // 응답 직후의 클라이언트 시간
    const clientTimeAfterRequest = Date.now();

    // 네트워크 지연을 고려한 평균 시간 계산
    const networkDelay = (clientTimeAfterRequest - clientTimeBeforeRequest) / 2;
    const adjustedClientTime = clientTimeBeforeRequest + networkDelay;

    const serverTime = response.data.result.serverTime;

    // 서버 시간과 클라이언트 시간의 차이 계산
    serverTimeOffset = serverTime - adjustedClientTime;
    lastSyncTime = Date.now();

    // 성공 시 재시도 카운트 및 실패 시간 초기화
    syncRetryCount = 0;
    lastFailedSyncTime = null;

    console.log('서버 시간 동기화 완료:', {
      serverTime: new Date(serverTime).toISOString(),
      clientTime: new Date(adjustedClientTime).toISOString(),
      offset: serverTimeOffset,
      networkDelay: Math.round(networkDelay),
    });
  } catch (error) {
    console.error('서버 시간 동기화 실패:', error);

    // 재시도 카운트 증가 및 실패 시간 기록
    syncRetryCount++;
    lastFailedSyncTime = Date.now();

    // 첫 번째 실패이거나 재시도 횟수를 초과하지 않은 경우에만 0으로 설정
    if (syncRetryCount >= MAX_RETRY_COUNT) {
      console.warn(
        '서버 시간 동기화 최대 재시도 횟수 도달. 클라이언트 시간을 사용합니다.',
      );
      serverTimeOffset = 0;
    } else {
      console.log(
        `${RETRY_DELAY / 1000}초 후 재시도합니다. (${syncRetryCount}/${MAX_RETRY_COUNT})`,
      );
    }
  } finally {
    isSyncing = false;
  }
};

/**
 * 서버 기준의 현재 Date 객체 반환
 *
 * @returns Date 서버 시간 기준의 Date 객체
 *
 * @example
 * ```typescript
 * // 기존 코드 (클라이언트 시간)
 * const today = new Date();
 *
 * // 변경 후 (서버 시간)
 * const today = getServerDate();
 * ```
 */
export const getServerDate = (): Date => {
  if (serverTimeOffset === null) {
    // 동기화 전에는 클라이언트 시간 사용 (경고 출력)
    console.warn(
      '서버 시간이 아직 동기화되지 않았습니다. 클라이언트 시간을 사용합니다.',
    );
    return new Date();
  }
  return new Date(Date.now() + serverTimeOffset);
};

/**
 * 서버 기준의 현재 타임스탬프 반환 (밀리초)
 *
 * @returns number 서버 시간 기준의 타임스탬프
 *
 * @example
 * ```typescript
 * // 기존 코드
 * const timestamp = Date.now();
 *
 * // 변경 후
 * const timestamp = getServerTime();
 * ```
 */
export const getServerTime = (): number => {
  if (serverTimeOffset === null) {
    console.warn(
      '서버 시간이 아직 동기화되지 않았습니다. 클라이언트 시간을 사용합니다.',
    );
    return Date.now();
  }
  return Date.now() + serverTimeOffset;
};

/**
 * 서버 시간 동기화 여부 확인
 *
 * @returns boolean 동기화 완료 여부
 */
export const isServerTimeSynced = (): boolean => {
  return serverTimeOffset !== null;
};

/**
 * 마지막 동기화 시간 조회
 *
 * @returns Date | null 마지막 동기화 시간
 */
export const getLastSyncTime = (): Date | null => {
  return lastSyncTime ? new Date(lastSyncTime) : null;
};

/**
 * 서버 시간 오프셋 조회 (디버깅용)
 *
 * @returns number | null 오프셋 (밀리초)
 */
export const getServerTimeOffset = (): number | null => {
  return serverTimeOffset;
};

/**
 * 서버 시간 동기화 강제 초기화 (테스트용)
 */
export const resetServerTimeSync = (): void => {
  serverTimeOffset = null;
  lastSyncTime = null;
  lastFailedSyncTime = null;
  syncRetryCount = 0;
  isSyncing = false;
  //   console.log('서버 시간 동기화가 초기화되었습니다.');
};
