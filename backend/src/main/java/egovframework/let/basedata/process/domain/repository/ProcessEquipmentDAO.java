package egovframework.let.basedata.process.domain.repository;

import egovframework.let.basedata.process.domain.model.ProcessEquipment;
import egovframework.let.basedata.process.domain.model.ProcessEquipmentVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 공정별 설비를 위한 데이터 접근 클래스
 * @author SHMT-MES
 * @since 2025.11.20
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.11.20 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Repository("ProcessEquipmentDAO")
public class ProcessEquipmentDAO extends EgovAbstractMapper {

    /**
     * 공정별 설비 목록을 조회한다.
     *
     * @param processEquipmentVO
     * @return
     * @throws Exception
     */
    public List<ProcessEquipmentVO> selectProcessEquipmentList(ProcessEquipmentVO processEquipmentVO) throws Exception {
        return selectList("ProcessEquipmentDAO.selectProcessEquipmentList", processEquipmentVO);
    }

    /**
     * 공정별 설비를 등록한다.
     *
     * @param processEquipment
     * @throws Exception
     */
    public void insertProcessEquipment(ProcessEquipment processEquipment) throws Exception {
        insert("ProcessEquipmentDAO.insertProcessEquipment", processEquipment);
    }

    /**
     * 공정별 설비를 수정한다.
     *
     * @param processEquipment
     * @throws Exception
     */
    public void updateProcessEquipment(ProcessEquipment processEquipment) throws Exception {
        update("ProcessEquipmentDAO.updateProcessEquipment", processEquipment);
    }

    /**
     * 공정별 설비를 삭제한다.
     *
     * @param processEquipmentId
     * @throws Exception
     */
    public void deleteProcessEquipment(String processEquipmentId) throws Exception {
        delete("ProcessEquipmentDAO.deleteProcessEquipment", processEquipmentId);
    }

    /**
     * 공정별 설비 중복을 체크한다.
     *
     * @param processEquipment
     * @return
     * @throws Exception
     */
    public int checkProcessEquipmentDuplicate(ProcessEquipment processEquipment) throws Exception {
        return selectOne("ProcessEquipmentDAO.checkProcessEquipmentDuplicate", processEquipment);
    }
}
