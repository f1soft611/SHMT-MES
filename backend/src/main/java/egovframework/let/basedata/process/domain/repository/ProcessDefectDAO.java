package egovframework.let.basedata.process.domain.repository;

import egovframework.let.basedata.process.domain.model.ProcessDefect;
import egovframework.let.basedata.process.domain.model.ProcessDefectVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 공정별 불량코드를 위한 데이터 접근 클래스
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
@Repository("ProcessDefectDAO")
public class ProcessDefectDAO extends EgovAbstractMapper {

    /**
     * 공정별 불량코드 목록을 조회한다.
     *
     * @param processDefectVO
     * @return
     * @throws Exception
     */
    public List<ProcessDefectVO> selectProcessDefectList(ProcessDefectVO processDefectVO) throws Exception {
        return selectList("ProcessDefectDAO.selectProcessDefectList", processDefectVO);
    }

    /**
     * 공정별 불량코드를 등록한다.
     *
     * @param processDefect
     * @throws Exception
     */
    public void insertProcessDefect(ProcessDefect processDefect) throws Exception {
        insert("ProcessDefectDAO.insertProcessDefect", processDefect);
    }

    /**
     * 공정별 불량코드를 수정한다.
     *
     * @param processDefect
     * @throws Exception
     */
    public void updateProcessDefect(ProcessDefect processDefect) throws Exception {
        update("ProcessDefectDAO.updateProcessDefect", processDefect);
    }

    /**
     * 공정별 불량코드를 삭제한다.
     *
     * @param processDefectId
     * @throws Exception
     */
    public void deleteProcessDefect(String processDefectId) throws Exception {
        delete("ProcessDefectDAO.deleteProcessDefect", processDefectId);
    }
}
