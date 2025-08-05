package egovframework.let.scheduler.service;

import egovframework.let.scheduler.model.InterfaceHistory;
import egovframework.let.scheduler.model.InterfaceHistoryVO;

import java.util.Map;

/**
 * 인터페이스 이력 관리를 위한 서비스 인터페이스 클래스
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
public interface EgovInterfaceHistoryService {

    /**
     * 조건에 맞는 인터페이스 이력 목록을 조회 한다.
     * @return
     *
     * @param interfaceHistoryVO
     * @exception Exception Exception
     */
    public Map<String, Object> selectInterfaceHistoryList(InterfaceHistoryVO interfaceHistoryVO)
            throws Exception;

    void insertInterfaceHistory(InterfaceHistory interfaceHistory) throws Exception;
}