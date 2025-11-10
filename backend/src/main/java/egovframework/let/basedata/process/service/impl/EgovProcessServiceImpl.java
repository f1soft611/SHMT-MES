package egovframework.let.basedata.process.service.impl;

import egovframework.let.basedata.process.domain.model.*;
import egovframework.let.basedata.process.domain.model.Process;
import egovframework.let.basedata.process.domain.repository.*;
import egovframework.let.basedata.process.service.EgovProcessService;
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
 * 공정 관리를 위한 서비스 구현 클래스
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
@Service("EgovProcessService")
@RequiredArgsConstructor
public class EgovProcessServiceImpl extends EgovAbstractServiceImpl implements EgovProcessService {

	private final ProcessDAO processDAO;
	private final WorkplaceProcessDAO workplaceProcessDAO;
	private final ProcessDefectDAO processDefectDAO;
	private final ProcessInspectionDAO processInspectionDAO;
	private final ProcessStopItemDAO processStopItemDAO;

	@Resource(name = "egovProcessIdGnrService")
	private EgovIdGnrService egovProcessIdGnrService;

	@Resource(name = "egovWorkplaceProcessIdGnrService")
	private EgovIdGnrService egovWorkplaceProcessIdGnrService;

	@Resource(name = "egovProcessDefectIdGnrService")
	private EgovIdGnrService egovProcessDefectIdGnrService;

	@Resource(name = "egovProcessInspectionIdGnrService")
	private EgovIdGnrService egovProcessInspectionIdGnrService;

	@Resource(name = "egovProcessStopItemIdGnrService")
	private EgovIdGnrService egovProcessStopItemIdGnrService;

	/**
	 * 공정 목록을 조회한다.
	 */
	@Override
	public Map<String, Object> selectProcessList(ProcessVO processVO) throws Exception {
		List<ProcessVO> resultList = processDAO.selectProcessList(processVO);
		int totalCount = processDAO.selectProcessListCnt(processVO);

		Map<String, Object> map = new HashMap<>();
		map.put("resultList", resultList);
		map.put("resultCnt", Integer.toString(totalCount));

		return map;
	}

	/**
	 * 공정 상세 정보를 조회한다.
	 */
	@Override
	public Process selectProcess(String processId) throws Exception {
		return processDAO.selectProcess(processId);
	}

	/**
	 * 공정을 등록한다.
	 */
	@Override
	@Transactional
	public void insertProcess(Process process) throws Exception {
		String processId = egovProcessIdGnrService.getNextStringId();
		process.setProcessId(processId);
		processDAO.insertProcess(process);
	}

	/**
	 * 공정을 수정한다.
	 */
	@Override
	@Transactional
	public void updateProcess(Process process) throws Exception {
		processDAO.updateProcess(process);
	}

	/**
	 * 공정을 삭제한다.
	 */
	@Override
	@Transactional
	public void deleteProcess(String processId) throws Exception {
		// Cascade delete will handle related records
		processDAO.deleteProcess(processId);
	}

	/**
	 * 작업장별 공정 목록을 조회한다.
	 */
	@Override
	public List<WorkplaceProcessVO> selectWorkplaceProcessList(WorkplaceProcessVO workplaceProcessVO) throws Exception {
		return workplaceProcessDAO.selectWorkplaceProcessList(workplaceProcessVO);
	}

	/**
	 * 작업장별 공정을 등록한다.
	 */
	@Override
	@Transactional
	public void insertWorkplaceProcess(WorkplaceProcess workplaceProcess) throws Exception {
		String workplaceProcessId = egovWorkplaceProcessIdGnrService.getNextStringId();
		workplaceProcess.setWorkplaceProcessId(workplaceProcessId);
		workplaceProcessDAO.insertWorkplaceProcess(workplaceProcess);
	}

	/**
	 * 작업장별 공정을 삭제한다.
	 */
	@Override
	@Transactional
	public void deleteWorkplaceProcess(String workplaceProcessId) throws Exception {
		workplaceProcessDAO.deleteWorkplaceProcess(workplaceProcessId);
	}

	/**
	 * 공정별 불량코드 목록을 조회한다.
	 */
	@Override
	public List<ProcessDefectVO> selectProcessDefectList(ProcessDefectVO processDefectVO) throws Exception {
		return processDefectDAO.selectProcessDefectList(processDefectVO);
	}

	/**
	 * 공정별 불량코드를 등록한다.
	 */
	@Override
	@Transactional
	public void insertProcessDefect(ProcessDefect processDefect) throws Exception {
		String processDefectId = egovProcessDefectIdGnrService.getNextStringId();
		processDefect.setProcessDefectId(processDefectId);
		processDefectDAO.insertProcessDefect(processDefect);
	}

	/**
	 * 공정별 불량코드를 수정한다.
	 */
	@Override
	@Transactional
	public void updateProcessDefect(ProcessDefect processDefect) throws Exception {
		processDefectDAO.updateProcessDefect(processDefect);
	}

	/**
	 * 공정별 불량코드를 삭제한다.
	 */
	@Override
	@Transactional
	public void deleteProcessDefect(String processDefectId) throws Exception {
		processDefectDAO.deleteProcessDefect(processDefectId);
	}

	/**
	 * 공정별 검사항목 목록을 조회한다.
	 */
	@Override
	public List<ProcessInspectionVO> selectProcessInspectionList(ProcessInspectionVO processInspectionVO) throws Exception {
		return processInspectionDAO.selectProcessInspectionList(processInspectionVO);
	}

	/**
	 * 공정별 검사항목을 등록한다.
	 */
	@Override
	@Transactional
	public void insertProcessInspection(ProcessInspection processInspection) throws Exception {
		String processInspectionId = egovProcessInspectionIdGnrService.getNextStringId();
		processInspection.setProcessInspectionId(processInspectionId);
		processInspectionDAO.insertProcessInspection(processInspection);
	}

	/**
	 * 공정별 검사항목을 수정한다.
	 */
	@Override
	@Transactional
	public void updateProcessInspection(ProcessInspection processInspection) throws Exception {
		processInspectionDAO.updateProcessInspection(processInspection);
	}

	/**
	 * 공정별 검사항목을 삭제한다.
	 */
	@Override
	@Transactional
	public void deleteProcessInspection(String processInspectionId) throws Exception {
		processInspectionDAO.deleteProcessInspection(processInspectionId);
	}

	/**
	 * 공정별 중지항목 목록을 조회한다.
	 */
	@Override
	public List<ProcessStopItemVO> selectProcessStopItemList(ProcessStopItemVO processStopItemVO) throws Exception {
		return processStopItemDAO.selectProcessStopItemList(processStopItemVO);
	}

	/**
	 * 공정별 중지항목을 등록한다.
	 */
	@Override
	@Transactional
	public void insertProcessStopItem(ProcessStopItem processStopItem) throws Exception {
		String processStopItemId = egovProcessStopItemIdGnrService.getNextStringId();
		processStopItem.setProcessStopItemId(processStopItemId);
		processStopItemDAO.insertProcessStopItem(processStopItem);
	}

	/**
	 * 공정별 중지항목을 수정한다.
	 */
	@Override
	@Transactional
	public void updateProcessStopItem(ProcessStopItem processStopItem) throws Exception {
		processStopItemDAO.updateProcessStopItem(processStopItem);
	}

	/**
	 * 공정별 중지항목을 삭제한다.
	 */
	@Override
	@Transactional
	public void deleteProcessStopItem(String processStopItemId) throws Exception {
		processStopItemDAO.deleteProcessStopItem(processStopItemId);
	}

	@Override
	public boolean isProcessCodeExists(String processCode) throws Exception {
		int count = processDAO.selectProcessCodeCheck(processCode);
		return count > 0;
	}

	@Override
	public boolean isProcessCodeExistsForUpdate(String processId, String processCode) throws Exception {
		Map<String, String> params = new HashMap<>();
		params.put("processId", processId);
		params.put("processCode", processCode);

		int count = processDAO.selectProcessCodeCheckForUpdate(params);
		return count > 0;
	}
}
