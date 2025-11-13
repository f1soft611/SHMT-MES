package egovframework.let.basedata.processFlow.service.impl;

import egovframework.let.basedata.process.domain.model.*;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlow;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowVO;
import egovframework.let.basedata.processFlow.domain.repository.ProcessFlowDAO;
import egovframework.let.basedata.processFlow.service.EgovProcessFlowService;
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
 * 공정 흐름 관리를 위한 서비스 구현 클래스
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
 *   2025.11.11 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Service("EgovProcessFlowService")
@RequiredArgsConstructor
public class EgovProcessFlowServiceImpl extends EgovAbstractServiceImpl implements EgovProcessFlowService {

	private final ProcessFlowDAO processFlowDAO;

	@Resource(name = "egovProcessFlowIdGnrService")
	private EgovIdGnrService egovProcessFlowIdGnrService;

	/**
	 * 공정 흐름 목록을 조회한다.
	 */
	@Override
	public Map<String, Object> selectProcessFlowList(ProcessFlowVO processFlowVO) throws Exception {
		List<ProcessFlowVO> resultList = processFlowDAO.selectProcessFlowList(processFlowVO);
//		int totalCount = processFlowDAO.selectProcessListCnt(processFlowVO);

		Map<String, Object> map = new HashMap<>();
		map.put("resultList", resultList);
//		map.put("resultCnt", Integer.toString(resultList.size()));

		return map;
	}

	/**
	 * 공정 흐름을 등록한다.
	 */
	@Transactional
	@Override
	public void createProcessFlow(ProcessFlow pf) throws Exception {
		String processId = egovProcessFlowIdGnrService.getNextStringId();
		pf.setProcessFlowId(processId);
		processFlowDAO.createProcessFlow(pf);
	}

	@Override
	public List<Map<String, Object>> selectProcessByFlowId(String processFlowId) throws Exception {
		return processFlowDAO.selectProcessByFlowId(processFlowId);
	}

	@Override
	public List<Map<String, Object>> selectItemByFlowId(String processFlowId) throws Exception {
		return processFlowDAO.selectItemByFlowId(processFlowId);
	}

	@Transactional
	@Override
	public void updateProcessFlow(ProcessFlow processFlow) throws Exception {
		processFlowDAO.updateProcessFlow(processFlow);
	}

	@Transactional
	@Override
	public void deleteProcessFlow(String processFlowId) throws Exception {
		processFlowDAO.deleteProcessFlow(processFlowId);
	}
}
