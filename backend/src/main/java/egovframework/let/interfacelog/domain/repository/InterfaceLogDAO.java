package egovframework.let.interfacelog.domain.repository;

import egovframework.let.interfacelog.domain.model.InterfaceLog;
import egovframework.let.interfacelog.domain.model.InterfaceLogVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 인터페이스 로그 관리를 위한 데이터 접근 클래스
 * @author 김기형
 * @since 2025.01.20
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.01.20 AI Assistant     최초 생성
 *
 * </pre>
 */
@Repository("InterfaceLogDAO")
public class InterfaceLogDAO extends EgovAbstractMapper {

    /**
     * 조건에 맞는 인터페이스 로그 목록을 조회 한다.
     *
     * @param interfaceLogVO
     * @return
     * @throws Exception
     */
    public List<InterfaceLogVO> selectInterfaceLogList(InterfaceLogVO interfaceLogVO) throws Exception {
		return selectList("InterfaceHistoryDAO.selectInterfaceLogList", interfaceLogVO);
	}

    /**
     * 조건에 맞는 인터페이스 로그 목록에 대한 전체 건수를 조회 한다.
     *
     * @param interfaceLogVO
     * @return
     * @throws Exception
     */
    public int selectInterfaceLogListCnt(InterfaceLogVO interfaceLogVO) throws Exception {
        return (Integer)selectOne("InterfaceHistoryDAO.selectInterfaceLogListCnt", interfaceLogVO);
    }

    /**
     * 특정 인터페이스 로그의 상세 정보를 조회 한다.
     *
     * @param logNo
     * @return
     * @throws Exception
     */
    public InterfaceLogVO selectInterfaceLogDetail(Long logNo) throws Exception {
        return selectOne("InterfaceHistoryDAO.selectInterfaceLogDetail", logNo);
    }
}