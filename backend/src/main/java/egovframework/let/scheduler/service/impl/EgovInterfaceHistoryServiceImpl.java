package egovframework.com.scheduler.service.impl;

import egovframework.com.scheduler.model.InterfaceHistory;
import egovframework.com.scheduler.model.InterfaceHistoryVO;
import egovframework.com.scheduler.mapper.InterfaceHistoryDAO;
import egovframework.com.scheduler.service.EgovInterfaceHistoryService;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 인터페이스 이력 관리를 위한 서비스 구현 클래스
 * @author 김기형
 * @since 2025.08.05
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.08.05 김기형          최초 생성
 *
 * </pre>
 */
@Service("EgovInterfaceHistoryService")
@RequiredArgsConstructor
public class EgovInterfaceHistoryServiceImpl extends EgovAbstractServiceImpl implements EgovInterfaceHistoryService {

    private final InterfaceHistoryDAO interfaceHistoryDAO;

    /**
     * 조건에 맞는 인터페이스 이력 목록을 조회 한다.
     *
     * @see egovframework.let.production.order.service.EgovInterfaceHistoryService#selectInterfaceHistoryList(InterfaceHistoryVO, String)
     */
    @Override
    public Map<String, Object> selectInterfaceHistoryList(InterfaceHistoryVO interfaceHistoryVO) throws Exception {
        List<InterfaceHistoryVO> result = new ArrayList<>();
        int cnt = 1;

        // 실제 로직 적용 시 아래 주석을 해제하고 사용하세요.
        // List<InterfaceHistoryVO> result = interfaceHistoryDAO.selectInterfaceHistoryList(interfaceHistoryVO);
        // int cnt = interfaceHistoryDAO.selectInterfaceHistoryListCnt(interfaceHistoryVO);

        Map<String, Object> map = new HashMap<>();
        map.put("resultList", result);
        map.put("resultCnt", Integer.toString(cnt));
        return map;
    }

    /**
     * 인터페이스 이력을 등록 한다.
     *
     * @param interfaceHistory
     * @throws Exception
     */
    @Override
    public void insertInterfaceHistory(InterfaceHistory interfaceHistory) throws Exception {
        interfaceHistoryDAO.insertInterfaceHistory(interfaceHistory);
    }
}
