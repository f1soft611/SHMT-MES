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
}
