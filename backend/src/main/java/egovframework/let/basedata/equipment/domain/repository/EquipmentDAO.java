package egovframework.let.basedata.equipment.domain.repository;

import egovframework.let.basedata.equipment.domain.model.Equipment;
import egovframework.let.basedata.equipment.domain.model.EquipmentVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * 설비 관리를 위한 데이터 접근 클래스
 * @author SHMT-MES
 * @since 2025.11.12
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.11.12 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Repository("EquipmentDAO")
public class EquipmentDAO extends EgovAbstractMapper {

    /**
     * 설비 목록을 조회한다.
     *
     * @param equipmentVO
     * @return
     * @throws Exception
     */
    public List<EquipmentVO> selectEquipmentList(EquipmentVO equipmentVO) throws Exception {
		return selectList("EquipmentDAO.selectEquipmentList", equipmentVO);
	}

    /**
     * 설비 목록 전체 건수를 조회한다.
     *
     * @param equipmentVO
     * @return
     * @throws Exception
     */
    public int selectEquipmentListCnt(EquipmentVO equipmentVO) throws Exception {
        return (Integer)selectOne("EquipmentDAO.selectEquipmentListCnt", equipmentVO);
    }

    /**
     * 설비 상세 정보를 조회한다.
     *
     * @param equipmentId
     * @return
     * @throws Exception
     */
    public Equipment selectEquipment(String equipmentId) throws Exception {
        return selectOne("EquipmentDAO.selectEquipment", equipmentId);
    }

    /**
     * 설비를 등록한다.
     *
     * @param equipment
     * @throws Exception
     */
    public void insertEquipment(Equipment equipment) throws Exception {
        insert("EquipmentDAO.insertEquipment", equipment);
    }

    /**
     * 설비를 수정한다.
     *
     * @param equipment
     * @throws Exception
     */
    public void updateEquipment(Equipment equipment) throws Exception {
        update("EquipmentDAO.updateEquipment", equipment);
    }

    /**
     * 설비를 삭제한다.
     *
     * @param equipmentId
     * @throws Exception
     */
    public void deleteEquipment(String equipmentId) throws Exception {
        delete("EquipmentDAO.deleteEquipment", equipmentId);
    }

    /**
     * 설비 코드 중복 체크
     */
    public int selectEquipmentCodeCheck(Map<String, String> params) {
        return selectOne("EquipmentDAO.selectEquipmentCodeCheck", params);
    }

    /**
     * 설비 코드 중복 체크 (수정 시)
     */
    public int selectEquipmentCodeCheckForUpdate(Map<String, String> params) {
        return selectOne("EquipmentDAO.selectEquipmentCodeCheckForUpdate", params);
    }
}
