package egovframework.let.basedata.process.domain.repository;

import egovframework.let.basedata.process.domain.model.ProcessInspection;
import egovframework.let.basedata.process.domain.model.ProcessInspectionVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 공정별 검사항목을 위한 데이터 접근 클래스
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
@Repository("ProcessInspectionDAO")
public class ProcessInspectionDAO extends EgovAbstractMapper {

    /**
     * 공정별 검사항목 목록을 조회한다.
     *
     * @param processInspectionVO
     * @return
     * @throws Exception
     */
    public List<ProcessInspectionVO> selectProcessInspectionList(ProcessInspectionVO processInspectionVO) throws Exception {
        return selectList("ProcessInspectionDAO.selectProcessInspectionList", processInspectionVO);
    }

    /**
     * 공정별 검사항목을 등록한다.
     *
     * @param processInspection
     * @throws Exception
     */
    public void insertProcessInspection(ProcessInspection processInspection) throws Exception {
        insert("ProcessInspectionDAO.insertProcessInspection", processInspection);
    }

    /**
     * 공정별 검사항목을 수정한다.
     *
     * @param processInspection
     * @throws Exception
     */
    public void updateProcessInspection(ProcessInspection processInspection) throws Exception {
        update("ProcessInspectionDAO.updateProcessInspection", processInspection);
    }

    /**
     * 공정별 검사항목을 삭제한다.
     *
     * @param processInspectionId
     * @throws Exception
     */
    public void deleteProcessInspection(String processInspectionId) throws Exception {
        delete("ProcessInspectionDAO.deleteProcessInspection", processInspectionId);
    }
}
