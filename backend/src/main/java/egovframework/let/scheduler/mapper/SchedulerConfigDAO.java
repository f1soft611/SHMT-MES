package egovframework.let.scheduler.mapper;

import egovframework.let.scheduler.model.SchedulerConfig;
import egovframework.let.scheduler.model.SchedulerConfigVO;
import egovframework.rte.psl.dataaccess.mapper.Mapper;

import java.util.List;

/**
 * 스케쥴러 설정 DAO
 * @author AI Assistant
 * @since 2025.10.23
 * @version 1.0
 */
@Mapper("schedulerConfigDAO")
public interface SchedulerConfigDAO {

    /**
     * 스케쥴러 목록을 조회한다.
     * @param searchVO
     * @return 스케쥴러 목록
     * @throws Exception
     */
    List<SchedulerConfigVO> selectSchedulerList(SchedulerConfigVO searchVO) throws Exception;

    /**
     * 스케쥴러 총 개수를 조회한다.
     * @param searchVO
     * @return 스케쥴러 총 개수
     * @throws Exception
     */
    int selectSchedulerListCnt(SchedulerConfigVO searchVO) throws Exception;

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
     * 모든 활성화된 스케쥴러를 조회한다.
     * @return 활성화된 스케쥴러 목록
     * @throws Exception
     */
    List<SchedulerConfig> selectEnabledSchedulers() throws Exception;
}
