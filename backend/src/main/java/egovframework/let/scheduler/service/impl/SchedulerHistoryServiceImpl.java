package egovframework.let.scheduler.service.impl;

import egovframework.let.scheduler.mapper.SchedulerHistoryDAO;
import egovframework.let.scheduler.model.SchedulerHistory;
import egovframework.let.scheduler.model.SchedulerHistoryVO;
import egovframework.let.scheduler.service.SchedulerHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 스케쥴러 실행 이력 서비스 구현체
 * @author AI Assistant
 * @since 2025.10.23
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class SchedulerHistoryServiceImpl implements SchedulerHistoryService {

    private final SchedulerHistoryDAO schedulerHistoryDAO;

    @Override
    public Map<String, Object> selectSchedulerHistoryList(SchedulerHistoryVO searchVO) throws Exception {
        List<SchedulerHistoryVO> resultList = schedulerHistoryDAO.selectSchedulerHistoryList(searchVO);
        int totalCount = schedulerHistoryDAO.selectSchedulerHistoryListCnt(searchVO);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", resultList);
        resultMap.put("resultCnt", String.valueOf(totalCount));

        return resultMap;
    }

    @Override
    public SchedulerHistory selectSchedulerHistoryDetail(Long historyId) throws Exception {
        return schedulerHistoryDAO.selectSchedulerHistoryDetail(historyId);
    }

    @Override
    @Transactional
    public void insertSchedulerHistory(SchedulerHistory history) throws Exception {
        schedulerHistoryDAO.insertSchedulerHistory(history);
    }

    @Override
    @Transactional
    public void updateSchedulerHistory(SchedulerHistory history) throws Exception {
        schedulerHistoryDAO.updateSchedulerHistory(history);
    }
}
