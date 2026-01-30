package egovframework.let.basedata.equipment.service.impl;

import egovframework.let.basedata.equipment.domain.model.Equipment;
import egovframework.let.basedata.equipment.domain.model.EquipmentVO;
import egovframework.let.basedata.equipment.domain.model.WorkcenterEquipRow;
import egovframework.let.basedata.equipment.domain.repository.EquipmentDAO;
import egovframework.let.basedata.equipment.service.EgovEquipmentService;
import egovframework.let.common.dto.ListResult;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.egovframe.rte.fdl.idgnr.EgovIdGnrService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 설비 관리를 위한 서비스 구현 클래스
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
@Service("EgovEquipmentService")
@RequiredArgsConstructor
public class EgovEquipmentServiceImpl extends EgovAbstractServiceImpl implements EgovEquipmentService {

	private final EquipmentDAO equipmentDAO;

	@Resource(name = "egovEquipmentIdGnrService")
	private EgovIdGnrService egovEquipmentIdGnrService;

	/**
	 * 설비 목록을 조회한다.
	 */
	@Override
	public Map<String, Object> selectEquipmentList(EquipmentVO equipmentVO) throws Exception {
		List<EquipmentVO> resultList = equipmentDAO.selectEquipmentList(equipmentVO);
		int totalCount = equipmentDAO.selectEquipmentListCnt(equipmentVO);

		Map<String, Object> map = new HashMap<>();
		map.put("resultList", resultList);
		map.put("resultCnt", Integer.toString(totalCount));

		return map;
	}

	/**
	 * 설비 상세 정보를 조회한다.
	 */
	@Override
	public Equipment selectEquipment(String equipmentId) throws Exception {
		return equipmentDAO.selectEquipment(equipmentId);
	}

	/**
	 * 설비를 등록한다.
	 */
	@Override
	@Transactional
	public void insertEquipment(Equipment equipment) throws Exception {
		String equipmentId = egovEquipmentIdGnrService.getNextStringId();
		equipment.setEquipmentId(equipmentId);
		equipment.setEquipSysCd(equipmentId);
		equipmentDAO.insertEquipment(equipment);
	}

	/**
	 * 설비를 수정한다.
	 */
	@Override
	@Transactional
	public void updateEquipment(Equipment equipment) throws Exception {
		equipmentDAO.updateEquipment(equipment);
	}

	/**
	 * 설비를 삭제한다.
	 */
	@Override
	@Transactional
	public void deleteEquipment(String equipmentId) throws Exception {
		equipmentDAO.deleteEquipment(equipmentId);
	}

	/**
	 * 설비 코드 존재 여부 확인
	 */
	@Override
	public boolean isEquipmentCodeExists(String equipSysCd, String equipCd) throws Exception {
		Map<String, String> params = new HashMap<>();
		params.put("equipSysCd", equipSysCd);
		params.put("equipCd", equipCd);
		int count = equipmentDAO.selectEquipmentCodeCheck(params);
		return count > 0;
	}

	/**
	 * 설비 코드 중복 체크 (수정 시)
	 */
	@Override
	public boolean isEquipmentCodeExistsForUpdate(String equipmentId, String equipSysCd, String equipCd) throws Exception {
		Map<String, String> params = new HashMap<>();
		params.put("equipmentId", equipmentId);
		params.put("equipSysCd", equipSysCd);
		params.put("equipCd", equipCd);
		int count = equipmentDAO.selectEquipmentCodeCheckForUpdate(params);
		return count > 0;
	}
	/**
	 * 작업장별 설비목록 리스트
	 */
	@Override
	public ListResult<WorkcenterEquipRow> selectEquipmentListByWorkplaceCode(String code) throws Exception {
		List<WorkcenterEquipRow> list = equipmentDAO.selectEquipmentListByWorkplaceCode(code);
		return new ListResult<>(list, 0);
	}


}
