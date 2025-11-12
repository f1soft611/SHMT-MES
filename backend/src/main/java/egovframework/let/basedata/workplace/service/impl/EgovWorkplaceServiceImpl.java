package egovframework.let.basedata.workplace.service.impl;

import egovframework.let.basedata.workplace.domain.model.*;
import egovframework.let.basedata.workplace.domain.repository.WorkplaceDAO;
import egovframework.let.basedata.workplace.domain.repository.WorkplaceProcessDAO;
import egovframework.let.basedata.workplace.domain.repository.WorkplaceWorkerDAO;
import egovframework.let.basedata.workplace.service.EgovWorkplaceService;
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
 * 작업장 관리를 위한 서비스 구현 클래스
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
@Service("EgovWorkplaceService")
@RequiredArgsConstructor
public class EgovWorkplaceServiceImpl extends EgovAbstractServiceImpl implements EgovWorkplaceService {

	private final WorkplaceDAO workplaceDAO;
	private final WorkplaceWorkerDAO workplaceWorkerDAO;
	private final WorkplaceProcessDAO workplaceProcessDAO;

	@Resource(name = "egovWorkplaceIdGnrService")
	private EgovIdGnrService egovWorkplaceIdGnrService;

	@Resource(name = "egovWorkplaceWorkerIdGnrService")
	private EgovIdGnrService egovWorkplaceWorkerIdGnrService;

	@Resource(name = "egovWorkplaceProcessIdGnrService")
	private EgovIdGnrService egovWorkplaceProcessIdGnrService;

	/**
	 * 작업장 목록을 조회한다.
	 */
	@Override
	public Map<String, Object> selectWorkplaceList(WorkplaceVO workplaceVO) throws Exception {
		List<WorkplaceVO> resultList = workplaceDAO.selectWorkplaceList(workplaceVO);
		int totalCount = workplaceDAO.selectWorkplaceListCnt(workplaceVO);

		Map<String, Object> map = new HashMap<>();
		map.put("resultList", resultList);
		map.put("resultCnt", Integer.toString(totalCount));

		return map;
	}

	/**
	 * 작업장 상세 정보를 조회한다.
	 */
	@Override
	public Workplace selectWorkplace(String workplaceId) throws Exception {
		return workplaceDAO.selectWorkplace(workplaceId);
	}

	/**
	 * 작업장을 등록한다.
	 */
	@Override
	@Transactional
	public void insertWorkplace(Workplace workplace) throws Exception {
		String workplaceId = egovWorkplaceIdGnrService.getNextStringId();
		workplace.setWorkplaceId(workplaceId);
		workplaceDAO.insertWorkplace(workplace);
	}

	/**
	 * 작업장을 수정한다.
	 */
	@Override
	@Transactional
	public void updateWorkplace(Workplace workplace) throws Exception {
		workplaceDAO.updateWorkplace(workplace);
	}

	/**
	 * 작업장을 삭제한다.
	 */
	@Override
	@Transactional
	public void deleteWorkplace(String workplaceId) throws Exception {
		// 작업장에 속한 작업자들도 함께 삭제
		workplaceWorkerDAO.deleteWorkplaceWorkersByWorkplaceId(workplaceId);
		workplaceDAO.deleteWorkplace(workplaceId);
	}

	/**
	 * 작업장별 작업자 목록을 조회한다.
	 */
	@Override
	public List<WorkplaceWorkerVO> selectWorkplaceWorkerList(WorkplaceWorkerVO workplaceWorkerVO) throws Exception {
		return workplaceWorkerDAO.selectWorkplaceWorkerList(workplaceWorkerVO);
	}

	/**
	 * 작업장별 작업자를 등록한다.
	 */
	@Override
	@Transactional
	public void insertWorkplaceWorker(WorkplaceWorker workplaceWorker) throws Exception {
		String workplaceWorkerId = egovWorkplaceWorkerIdGnrService.getNextStringId();
		workplaceWorker.setWorkplaceWorkerId(workplaceWorkerId);
		workplaceWorkerDAO.insertWorkplaceWorker(workplaceWorker);
	}

	/**
	 * 작업장별 작업자를 삭제한다.
	 */
	@Override
	@Transactional
	public void deleteWorkplaceWorker(WorkplaceWorker workplaceWorker) throws Exception {
		workplaceWorkerDAO.deleteWorkplaceWorker(workplaceWorker);
	}

	@Override
	public boolean isWorkplaceCodeExists(String workplaceCode) throws Exception {
		int count = workplaceDAO.selectWorkplaceCodeCheck(workplaceCode);
		return count > 0;
	}

	@Override
	public boolean isWorkplaceCodeExistsForUpdate(String workplaceId, String workplaceCode) throws Exception {
		Map<String, String> params = new HashMap<>();
		params.put("workplaceId", workplaceId);
		params.put("workplaceCode", workplaceCode);

		int count = workplaceDAO.selectWorkplaceCodeCheckForUpdate(params);
		return count > 0;
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
	public void deleteWorkplaceProcess(WorkplaceProcess workplaceProcess) throws Exception {
		workplaceProcessDAO.deleteWorkplaceProcess(workplaceProcess);
	}
}
