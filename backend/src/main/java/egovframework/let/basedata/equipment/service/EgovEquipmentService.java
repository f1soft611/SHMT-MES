package egovframework.let.basedata.equipment.service;

import egovframework.let.basedata.equipment.domain.model.Equipment;
import egovframework.let.basedata.equipment.domain.model.EquipmentVO;
import egovframework.let.basedata.equipment.domain.model.WorkcenterEquipRow;
import egovframework.let.common.dto.ListResult;

import java.util.List;
import java.util.Map;

/**
 * 설비 관리를 위한 서비스 인터페이스 클래스
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
public interface EgovEquipmentService {

	/**
	 * 설비 목록을 조회한다.
	 * 
	 * @param equipmentVO
	 * @exception Exception
	 */
	public Map<String, Object> selectEquipmentList(EquipmentVO equipmentVO) throws Exception;

	/**
	 * 설비 상세 정보를 조회한다.
	 * 
	 * @param equipmentId
	 * @exception Exception
	 */
	public Equipment selectEquipment(String equipmentId) throws Exception;

	/**
	 * 설비를 등록한다.
	 * 
	 * @param equipment
	 * @exception Exception
	 */
	public void insertEquipment(Equipment equipment) throws Exception;

	/**
	 * 설비를 수정한다.
	 * 
	 * @param equipment
	 * @exception Exception
	 */
	public void updateEquipment(Equipment equipment) throws Exception;

	/**
	 * 설비를 삭제한다.
	 * 
	 * @param equipCd
	 * @exception Exception
	 */
	public void deleteEquipment(String equipCd) throws Exception;

	/**
	 * 설비 코드 존재 여부 확인
	 * @param equipSysCd 시스템 코드
	 * @param equipCd 설비 코드
	 * @return 존재 여부
	 * @throws Exception
	 */
	boolean isEquipmentCodeExists(String equipSysCd, String equipCd) throws Exception;

	/**
	 * 설비 코드 중복 체크 (수정 시)
	 * @param equipmentId 설비 ID
	 * @param equipSysCd 시스템 코드
	 * @param equipCd 설비 코드
	 * @return 중복 여부
	 * @throws Exception
	 */
	boolean isEquipmentCodeExistsForUpdate(String equipmentId, String equipSysCd, String equipCd) throws Exception;


	/**
	 * 작업장별 설비목록 리스트
	 */
	ListResult<WorkcenterEquipRow> selectEquipmentListByWorkplaceCode(String code) throws Exception;
}
