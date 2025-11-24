package egovframework.let.basedata.workplace.service;

import egovframework.let.basedata.workplace.domain.model.*;
import java.util.List;
import java.util.Map;

/**
 * 작업장 관리를 위한 서비스 인터페이스 클래스
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
public interface EgovWorkplaceService {

	/**
	 * 작업장 목록을 조회한다.
	 * 
	 * @param workplaceVO
	 * @exception Exception
	 */
	public Map<String, Object> selectWorkplaceList(WorkplaceVO workplaceVO) throws Exception;

	/**
	 * 작업장 상세 정보를 조회한다.
	 * 
	 * @param workplaceId
	 * @exception Exception
	 */
	public Workplace selectWorkplace(String workplaceId) throws Exception;

	/**
	 * 작업장을 등록한다.
	 * 
	 * @param workplace
	 * @exception Exception
	 */
	public void insertWorkplace(Workplace workplace) throws Exception;

	/**
	 * 작업장을 수정한다.
	 * 
	 * @param workplace
	 * @exception Exception
	 */
	public void updateWorkplace(Workplace workplace) throws Exception;

	/**
	 * 작업장을 삭제한다.
	 * 
	 * @param workplaceId
	 * @exception Exception
	 */
	public void deleteWorkplace(String workplaceId) throws Exception;

	/**
	 * 작업장별 작업자 목록을 조회한다.
	 * 
	 * @param workplaceWorkerVO
	 * @exception Exception
	 */
	public List<WorkplaceWorkerVO> selectWorkplaceWorkerList(WorkplaceWorkerVO workplaceWorkerVO) throws Exception;

	/**
	 * 작업장별 작업자를 등록한다.
	 * 
	 * @param workplaceWorker
	 * @exception Exception
	 */
	public void insertWorkplaceWorker(WorkplaceWorker workplaceWorker) throws Exception;

	/**
	 * 작업장별 작업자를 수정한다.
	 *
	 * @param workplaceWorker
	 * @exception Exception
	 */
	public void updateWorkplaceWorker(WorkplaceWorker workplaceWorker) throws Exception;

	/**
	 * 작업장별 작업자를 삭제한다.
	 * 
	 * @param workplaceWorker
	 * @exception Exception
	 */
	public void deleteWorkplaceWorker(WorkplaceWorker workplaceWorker) throws Exception;

	/**
	 * 작업장별 공정 목록을 조회한다.
	 *
	 * @param workplaceProcessVO
	 * @exception Exception
	 */
	public List<WorkplaceProcessVO> selectWorkplaceProcessList(WorkplaceProcessVO workplaceProcessVO) throws Exception;

	/**
	 * 작업장별 공정을 등록한다.
	 *
	 * @param workplaceProcess
	 * @exception Exception
	 */
	public void insertWorkplaceProcess(WorkplaceProcess workplaceProcess) throws Exception;

	/**
	 * 작업장별 공정을 삭제한다.
	 *
	 * @param workplaceProcess
	 * @exception Exception
	 */
	public void deleteWorkplaceProcess(WorkplaceProcess workplaceProcess) throws Exception;

	/**
	 * 작업장 코드 존재 여부 확인
	 * @param workplaceCode 작업장 코드
	 * @return 존재 여부
	 * @throws Exception
	 */
	boolean isWorkplaceCodeExists(String workplaceCode) throws Exception;

	/**
	 * 작업장 코드 중복 체크 (수정 시)
	 * @param workplaceId 작업장 ID
	 * @param workplaceCode 작업장 코드
	 * @return 중복 여부
	 * @throws Exception
	 */
	boolean isWorkplaceCodeExistsForUpdate(String workplaceId, String workplaceCode) throws Exception;

	/**
	 * 작업장별 설비 목록을 조회한다.
	 * @param workplaceCode 작업장 코드
	 * @return 설비 목록
	 * @throws Exception
	 */
	List<Map<String, Object>> selectWorkplaceEquipmentList(String workplaceCode) throws Exception;
}
