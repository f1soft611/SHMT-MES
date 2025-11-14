package egovframework.let.basedata.workplace.domain.repository;

import egovframework.let.basedata.workplace.domain.model.WorkplaceWorker;
import egovframework.let.basedata.workplace.domain.model.WorkplaceWorkerVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 작업장별 작업자 관리를 위한 데이터 접근 클래스
 * @author SHMT-MES
 * @since 2025.10.21
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.10.21 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Repository("WorkplaceWorkerDAO")
public class WorkplaceWorkerDAO extends EgovAbstractMapper {

    /**
     * 작업장별 작업자 목록을 조회한다.
     *
     * @param workplaceWorkerVO
     * @return
     * @throws Exception
     */
    public List<WorkplaceWorkerVO> selectWorkplaceWorkerList(WorkplaceWorkerVO workplaceWorkerVO) throws Exception {
		return selectList("WorkplaceWorkerDAO.selectWorkplaceWorkerList", workplaceWorkerVO);
	}

    /**
     * 작업장별 작업자를 등록한다.
     *
     * @param workplaceWorker
     * @throws Exception
     */
    public void insertWorkplaceWorker(WorkplaceWorker workplaceWorker) throws Exception {
        insert("WorkplaceWorkerDAO.insertWorkplaceWorker", workplaceWorker);
    }

    /**
     * 작업장별 작업자를 수정한다.
     *
     * @param workplaceWorker
     * @throws Exception
     */
    public void updateWorkplaceWorker(WorkplaceWorker workplaceWorker) throws Exception {
        delete("WorkplaceWorkerDAO.updateWorkplaceWorker", workplaceWorker);
    }

    /**
     * 작업장별 작업자를 삭제한다.
     *
     * @param workplaceWorker
     * @throws Exception
     */
    public void deleteWorkplaceWorker(WorkplaceWorker workplaceWorker) throws Exception {
        delete("WorkplaceWorkerDAO.deleteWorkplaceWorker", workplaceWorker);
    }

    /**
     * 작업장의 모든 작업자를 삭제한다.
     *
     * @param workplaceId
     * @throws Exception
     */
    public void deleteWorkplaceWorkersByWorkplaceId(String workplaceId) throws Exception {
        delete("WorkplaceWorkerDAO.deleteWorkplaceWorkersByWorkplaceId", workplaceId);
    }
}
