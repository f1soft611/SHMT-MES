package egovframework.com.scheduler.mapper;

import egovframework.com.scheduler.model.InterfaceHistory;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 인터페이스 이력 관리를 위한 데이터 접근 클래스
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
@Repository("InterfaceHistoryDAO")
public class InterfaceHistoryDAO extends EgovAbstractMapper {

    /**
     * 조건에 맞는 인터페이스 이력 목록을 조회 한다.
     *
     * @param interfaceHistoryVO
     * @return
     * @throws Exception
     */
    public List<InterfaceHistory> selectInterfaceHistoryList(InterfaceHistory interfaceHistoryVO) throws Exception {
        return selectList("InterfaceHistoryDAO.selectInterfaceHistoryList", interfaceHistoryVO);
    }

    /**
     * 조건에 맞는 인터페이스 이력 목록에 대한 전체 건수를 조회 한다.
     *
     * @param interfaceHistoryVO
     * @return
     * @throws Exception
     */
    public int selectInterfaceHistoryListCnt(InterfaceHistory interfaceHistoryVO) throws Exception {
        return (Integer)selectOne("InterfaceHistoryDAO.selectInterfaceHistoryListCnt", interfaceHistoryVO);
    }

    /**
     * 인터페이스 이력을 등록 한다.
     *
     * @param interfaceHistory
     * @throws Exception
     */
    public void insertInterfaceHistory(InterfaceHistory interfaceHistory) throws Exception {
        insert("InterfaceHistoryDAO.insertInterfaceHistory", interfaceHistory);
    }
}
