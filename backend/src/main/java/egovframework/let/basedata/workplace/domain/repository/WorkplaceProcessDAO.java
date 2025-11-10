package egovframework.let.basedata.workplace.domain.repository;

import egovframework.let.basedata.workplace.domain.model.WorkplaceProcess;
import egovframework.let.basedata.workplace.domain.model.WorkplaceProcessVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 작업장별 공정 매핑을 위한 데이터 접근 클래스
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
@Repository("WorkplaceProcessDAO")
public class WorkplaceProcessDAO extends EgovAbstractMapper {

    /**
     * 작업장별 공정 목록을 조회한다.
     *
     * @param workplaceProcessVO
     * @return
     * @throws Exception
     */
    public List<WorkplaceProcessVO> selectWorkplaceProcessList(WorkplaceProcessVO workplaceProcessVO) throws Exception {
        return selectList("WorkplaceProcessDAO.selectWorkplaceProcessList", workplaceProcessVO);
    }

    /**
     * 작업장별 공정을 등록한다.
     *
     * @param workplaceProcess
     * @throws Exception
     */
    public void insertWorkplaceProcess(WorkplaceProcess workplaceProcess) throws Exception {
        insert("WorkplaceProcessDAO.insertWorkplaceProcess", workplaceProcess);
    }

    /**
     * 작업장별 공정을 삭제한다.
     *
     * @param workplaceProcessId
     * @throws Exception
     */
    public void deleteWorkplaceProcess(WorkplaceProcess workplaceProcess) throws Exception {
        delete("WorkplaceProcessDAO.deleteWorkplaceProcess", workplaceProcess);
    }
}
