package egovframework.let.basedata.process.domain.repository;

import egovframework.let.basedata.process.domain.model.ProcessWorkplace;
import egovframework.let.basedata.process.domain.model.ProcessWorkplaceVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 공정별 작업장 매핑을 위한 데이터 접근 클래스
 * @author SHMT-MES
 * @since 2025.10.24
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.10.24 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Repository("ProcessWorkplaceDAO")
public class ProcessWorkplaceDAO extends EgovAbstractMapper {

    /**
     * 공정별 작업장 목록을 조회한다.
     *
     * @param processWorkplaceVO
     * @return
     * @throws Exception
     */
    public List<ProcessWorkplaceVO> selectProcessWorkplaceList(ProcessWorkplaceVO processWorkplaceVO) throws Exception {
        return selectList("ProcessWorkplaceDAO.selectProcessWorkplaceList", processWorkplaceVO);
    }

    /**
     * 공정별 작업장을 등록한다.
     *
     * @param processWorkplace
     * @throws Exception
     */
    public void insertProcessWorkplace(ProcessWorkplace processWorkplace) throws Exception {
        insert("ProcessWorkplaceDAO.insertProcessWorkplace", processWorkplace);
    }

    /**
     * 공정별 작업장을 삭제한다.
     *
     * @param processWorkplaceId
     * @throws Exception
     */
    public void deleteProcessWorkplace(String processWorkplaceId) throws Exception {
        delete("ProcessWorkplaceDAO.deleteProcessWorkplace", processWorkplaceId);
    }
}
