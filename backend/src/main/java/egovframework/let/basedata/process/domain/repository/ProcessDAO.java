package egovframework.let.basedata.process.domain.repository;

import egovframework.let.basedata.process.domain.model.Process;
import egovframework.let.basedata.process.domain.model.ProcessVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * 공정 관리를 위한 데이터 접근 클래스
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
@Repository("ProcessDAO")
public class ProcessDAO extends EgovAbstractMapper {

    /**
     * 공정 목록을 조회한다.
     *
     * @param processVO
     * @return
     * @throws Exception
     */
    public List<ProcessVO> selectProcessList(ProcessVO processVO) throws Exception {
		return selectList("ProcessDAO.selectProcessList", processVO);
	}

    /**
     * 공정 목록 전체 건수를 조회한다.
     *
     * @param processVO
     * @return
     * @throws Exception
     */
    public int selectProcessListCnt(ProcessVO processVO) throws Exception {
        return (Integer)selectOne("ProcessDAO.selectProcessListCnt", processVO);
    }

    /**
     * 공정 상세 정보를 조회한다.
     *
     * @param processId
     * @return
     * @throws Exception
     */
    public Process selectProcess(String processId) throws Exception {
        return selectOne("ProcessDAO.selectProcess", processId);
    }

    /**
     * 공정을 등록한다.
     *
     * @param process
     * @throws Exception
     */
    public void insertProcess(Process process) throws Exception {
        insert("ProcessDAO.insertProcess", process);
    }

    /**
     * 공정을 수정한다.
     *
     * @param process
     * @throws Exception
     */
    public void updateProcess(Process process) throws Exception {
        update("ProcessDAO.updateProcess", process);
    }

    /**
     * 공정을 삭제한다.
     *
     * @param processId
     * @throws Exception
     */
    public void deleteProcess(String processId) throws Exception {
        delete("ProcessDAO.deleteProcess", processId);
    }

    /**
     * 공정 코드 중복 체크
     */
    public int selectProcessCodeCheck(String processCode) {
        return selectOne("ProcessDAO.selectProcessCodeCheck", processCode);
    }

    /**
     * 공정 코드 중복 체크 (수정 시)
     */
    public int selectProcessCodeCheckForUpdate(Map<String, String> params) {
        return selectOne("ProcessDAO.selectProcessCodeCheckForUpdate", params);
    }
}
