package egovframework.let.scheduler.mapper;

import egovframework.let.scheduler.model.InterfaceHistory;
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
     * 인터페이스 이력을 등록 한다.
     *
     * @param interfaceHistory
     * @throws Exception
     */
    public void insertInterfaceHistory(InterfaceHistory interfaceHistory) throws Exception {
        insert("InterfaceHistoryDAO.insertInterfaceHistory", interfaceHistory);
    }
}
