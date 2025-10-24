package egovframework.let.basedata.process.service;

import egovframework.let.basedata.process.domain.model.*;

import java.util.List;
import java.util.Map;

/**
 * 공정 관리를 위한 서비스 인터페이스 클래스
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
public interface EgovProcessService {

	/**
	 * 공정 목록을 조회한다.
	 * 
	 * @param processVO
	 * @exception Exception
	 */
	public Map<String, Object> selectProcessList(ProcessVO processVO) throws Exception;

	/**
	 * 공정 상세 정보를 조회한다.
	 * 
	 * @param processId
	 * @exception Exception
	 */
	public Process selectProcess(String processId) throws Exception;

	/**
	 * 공정을 등록한다.
	 * 
	 * @param process
	 * @exception Exception
	 */
	public void insertProcess(Process process) throws Exception;

	/**
	 * 공정을 수정한다.
	 * 
	 * @param process
	 * @exception Exception
	 */
	public void updateProcess(Process process) throws Exception;

	/**
	 * 공정을 삭제한다.
	 * 
	 * @param processId
	 * @exception Exception
	 */
	public void deleteProcess(String processId) throws Exception;

	/**
	 * 공정별 작업장 목록을 조회한다.
	 * 
	 * @param processWorkplaceVO
	 * @exception Exception
	 */
	public List<ProcessWorkplaceVO> selectProcessWorkplaceList(ProcessWorkplaceVO processWorkplaceVO) throws Exception;

	/**
	 * 공정별 작업장을 등록한다.
	 * 
	 * @param processWorkplace
	 * @exception Exception
	 */
	public void insertProcessWorkplace(ProcessWorkplace processWorkplace) throws Exception;

	/**
	 * 공정별 작업장을 삭제한다.
	 * 
	 * @param processWorkplaceId
	 * @exception Exception
	 */
	public void deleteProcessWorkplace(String processWorkplaceId) throws Exception;

	/**
	 * 공정별 불량코드 목록을 조회한다.
	 * 
	 * @param processDefectVO
	 * @exception Exception
	 */
	public List<ProcessDefectVO> selectProcessDefectList(ProcessDefectVO processDefectVO) throws Exception;

	/**
	 * 공정별 불량코드를 등록한다.
	 * 
	 * @param processDefect
	 * @exception Exception
	 */
	public void insertProcessDefect(ProcessDefect processDefect) throws Exception;

	/**
	 * 공정별 불량코드를 수정한다.
	 * 
	 * @param processDefect
	 * @exception Exception
	 */
	public void updateProcessDefect(ProcessDefect processDefect) throws Exception;

	/**
	 * 공정별 불량코드를 삭제한다.
	 * 
	 * @param processDefectId
	 * @exception Exception
	 */
	public void deleteProcessDefect(String processDefectId) throws Exception;

	/**
	 * 공정별 검사항목 목록을 조회한다.
	 * 
	 * @param processInspectionVO
	 * @exception Exception
	 */
	public List<ProcessInspectionVO> selectProcessInspectionList(ProcessInspectionVO processInspectionVO) throws Exception;

	/**
	 * 공정별 검사항목을 등록한다.
	 * 
	 * @param processInspection
	 * @exception Exception
	 */
	public void insertProcessInspection(ProcessInspection processInspection) throws Exception;

	/**
	 * 공정별 검사항목을 수정한다.
	 * 
	 * @param processInspection
	 * @exception Exception
	 */
	public void updateProcessInspection(ProcessInspection processInspection) throws Exception;

	/**
	 * 공정별 검사항목을 삭제한다.
	 * 
	 * @param processInspectionId
	 * @exception Exception
	 */
	public void deleteProcessInspection(String processInspectionId) throws Exception;

	/**
	 * 공정 코드 존재 여부 확인
	 * @param processCode 공정 코드
	 * @return 존재 여부
	 * @throws Exception
	 */
	boolean isProcessCodeExists(String processCode) throws Exception;

	/**
	 * 공정 코드 중복 체크 (수정 시)
	 * @param processId 공정 ID
	 * @param processCode 공정 코드
	 * @return 중복 여부
	 * @throws Exception
	 */
	boolean isProcessCodeExistsForUpdate(String processId, String processCode) throws Exception;
}
