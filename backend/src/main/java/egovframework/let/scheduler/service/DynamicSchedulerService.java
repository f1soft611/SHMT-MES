package egovframework.let.scheduler.service;

/**
 * 동적 스케쥴러 관리 서비스
 * @author AI Assistant
 * @since 2025.10.23
 * @version 1.0
 */
public interface DynamicSchedulerService {

    /**
     * 모든 스케쥴러를 재시작한다.
     * @throws Exception
     */
    void restartSchedulers() throws Exception;

    /**
     * 스케쥴러를 초기화한다.
     * @throws Exception
     */
    void initializeSchedulers() throws Exception;

    /**
     * 특정 스케쥴러를 즉시 실행한다.
     * @param schedulerId 스케쥴러 ID
     * @param fromDate 조회 시작 날짜 (yyyy-MM-dd), null이면 오늘 날짜 사용
     * @param toDate 조회 종료 날짜 (yyyy-MM-dd), null이면 오늘 날짜 사용
     * @throws Exception
     */
    void executeSchedulerManually(Long schedulerId, String fromDate, String toDate) throws Exception;
}
