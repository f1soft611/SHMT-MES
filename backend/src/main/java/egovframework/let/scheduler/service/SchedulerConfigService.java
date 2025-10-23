package egovframework.let.scheduler.service;

import egovframework.let.scheduler.model.SchedulerConfig;
import egovframework.let.scheduler.model.SchedulerConfigVO;

import java.util.Map;

/**
 * 스케쥴러 설정 관리 서비스
 * @author AI Assistant
 * @since 2025.10.23
 * @version 1.0
 */
public interface SchedulerConfigService {

    /**
     * 스케쥴러 목록을 조회한다.
     * @param searchVO
     * @return 스케쥴러 목록
     * @throws Exception
     */
    Map<String, Object> selectSchedulerList(SchedulerConfigVO searchVO) throws Exception;

    /**
     * 스케쥴러 상세정보를 조회한다.
     * @param schedulerId
     * @return 스케쥴러 정보
     * @throws Exception
     */
    SchedulerConfig selectSchedulerDetail(Long schedulerId) throws Exception;

    /**
     * 스케쥴러를 등록한다.
     * @param scheduler
     * @throws Exception
     */
    void insertScheduler(SchedulerConfig scheduler) throws Exception;

    /**
     * 스케쥴러를 수정한다.
     * @param scheduler
     * @throws Exception
     */
    void updateScheduler(SchedulerConfig scheduler) throws Exception;

    /**
     * 스케쥴러를 삭제한다.
     * @param schedulerId
     * @throws Exception
     */
    void deleteScheduler(Long schedulerId) throws Exception;

    /**
     * 스케쥴러를 재시작한다.
     * @throws Exception
     */
    void restartSchedulers() throws Exception;
}
