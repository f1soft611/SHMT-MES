package egovframework.let.basedata.workplace.domain.repository;

import egovframework.let.basedata.workplace.domain.model.Workplace;
import egovframework.let.basedata.workplace.domain.model.WorkplaceVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 작업장 관리를 위한 데이터 접근 클래스
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
@Repository("WorkplaceDAO")
public class WorkplaceDAO extends EgovAbstractMapper {

    /**
     * 작업장 목록을 조회한다.
     *
     * @param workplaceVO
     * @return
     * @throws Exception
     */
    public List<WorkplaceVO> selectWorkplaceList(WorkplaceVO workplaceVO) throws Exception {
		return selectList("WorkplaceDAO.selectWorkplaceList", workplaceVO);
	}

    /**
     * 작업장 목록 전체 건수를 조회한다.
     *
     * @param workplaceVO
     * @return
     * @throws Exception
     */
    public int selectWorkplaceListCnt(WorkplaceVO workplaceVO) throws Exception {
        return (Integer)selectOne("WorkplaceDAO.selectWorkplaceListCnt", workplaceVO);
    }

    /**
     * 작업장 상세 정보를 조회한다.
     *
     * @param workplaceId
     * @return
     * @throws Exception
     */
    public Workplace selectWorkplace(String workplaceId) throws Exception {
        return selectOne("WorkplaceDAO.selectWorkplace", workplaceId);
    }

    /**
     * 작업장을 등록한다.
     *
     * @param workplace
     * @throws Exception
     */
    public void insertWorkplace(Workplace workplace) throws Exception {
        insert("WorkplaceDAO.insertWorkplace", workplace);
    }

    /**
     * 작업장을 수정한다.
     *
     * @param workplace
     * @throws Exception
     */
    public void updateWorkplace(Workplace workplace) throws Exception {
        update("WorkplaceDAO.updateWorkplace", workplace);
    }

    /**
     * 작업장을 삭제한다.
     *
     * @param workplaceId
     * @throws Exception
     */
    public void deleteWorkplace(String workplaceId) throws Exception {
        delete("WorkplaceDAO.deleteWorkplace", workplaceId);
    }
}
