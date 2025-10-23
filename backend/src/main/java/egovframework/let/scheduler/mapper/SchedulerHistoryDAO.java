package egovframework.let.scheduler.mapper;

import egovframework.let.scheduler.model.SchedulerHistory;
import egovframework.let.scheduler.model.SchedulerHistoryVO;
import egovframework.rte.psl.dataaccess.mapper.Mapper;

import java.util.List;

/**
 * 스케쥴러 실행 이력 DAO
 * @author AI Assistant
 * @since 2025.10.23
 * @version 1.0
 */
@Mapper("schedulerHistoryDAO")
public interface SchedulerHistoryDAO {

    /**
     * 스케쥴러 실행 이력 목록을 조회한다.
     * @param searchVO
     * @return 실행 이력 목록
     * @throws Exception
     */
    List<SchedulerHistoryVO> selectSchedulerHistoryList(SchedulerHistoryVO searchVO) throws Exception;

    /**
     * 스케쥴러 실행 이력 총 개수를 조회한다.
     * @param searchVO
     * @return 실행 이력 총 개수
     * @throws Exception
     */
    int selectSchedulerHistoryListCnt(SchedulerHistoryVO searchVO) throws Exception;

    /**
     * 스케쥴러 실행 이력 상세정보를 조회한다.
     * @param historyId
     * @return 실행 이력 정보
     * @throws Exception
     */
    SchedulerHistory selectSchedulerHistoryDetail(Long historyId) throws Exception;

    /**
     * 스케쥴러 실행 이력을 등록한다.
     * @param history
     * @throws Exception
     */
    void insertSchedulerHistory(SchedulerHistory history) throws Exception;

    /**
     * 스케쥴러 실행 이력을 수정한다.
     * @param history
     * @throws Exception
     */
    void updateSchedulerHistory(SchedulerHistory history) throws Exception;
}
