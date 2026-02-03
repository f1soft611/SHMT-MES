package egovframework.let.basedata.processFlow.service.impl;

import egovframework.com.cmm.exception.BizException;
import egovframework.let.basedata.process.domain.model.*;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlow;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowItem;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowProcess;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowVO;
import egovframework.let.basedata.processFlow.domain.repository.ProcessFlowDAO;
import egovframework.let.basedata.processFlow.service.EgovProcessFlowService;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.egovframe.rte.fdl.idgnr.EgovIdGnrService;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.sql.SQLException;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

	@Resource(name = "egovProcessFlowProcessIdGnrService")
	private EgovIdGnrService egovProcessFlowProcessIdGnrService;

	@Resource(name = "egovProcessFlowItemIdGnrService")
	private EgovIdGnrService egovProcessFlowItemIdGnrService;

	/**
	 * 공정 흐름 목록을 조회한다.
	 */
	@Override
	public Map<String, Object> selectProcessFlowList(ProcessFlowVO processFlowVO) throws Exception {
		List<ProcessFlowVO> resultList = processFlowDAO.selectProcessFlowList(processFlowVO);
		int resultCnt = processFlowDAO.selectProcessFlowListCnt(processFlowVO);

		Map<String, Object> map = new HashMap<>();
		map.put("resultList", resultList);
		map.put("resultCnt", Integer.toString(resultCnt));

		return map;
	}

	/**
	 * 공정 흐름을 등록한다.
	 */
	@Transactional
	@Override
	public void createProcessFlow(ProcessFlow pf) throws Exception {
		String processId = processFlowDAO.selectProcessFlowCode();
		String processCode = processFlowDAO.selectProcessFlowCode();
		pf.setProcessFlowId(processId);
		pf.setProcessFlowCode(processCode);
		processFlowDAO.createProcessFlow(pf);
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




	@Override
	public List<ProcessFlowProcess> selectProcessByFlowId(String processFlowId) throws Exception {
		return processFlowDAO.selectProcessByFlowId(processFlowId);
	}

	@Transactional
	@Override
	public void createProcessFlowProcess(String processFlowId, List<ProcessFlowProcess> processList) throws Exception {

		// processFlowId 기준 기존 데이터 삭제 (있다면)
		processFlowDAO.deleteProcessFlowProcess(processFlowId);

		if (processList.isEmpty()) {
			return;
		}

		// seq 기준 전체 정렬
		processList.sort(Comparator.comparingInt(p -> Integer.parseInt(p.getSeq())));

		// processCode 별 그룹핑
		Map<String, List<ProcessFlowProcess>> grouped =
				processList.stream().collect(Collectors.groupingBy(ProcessFlowProcess::getFlowProcessCode));

		// 같은 공정(processCode)끼리 processSeq 재할당
		for (List<ProcessFlowProcess> group : grouped.values()) {

			group.sort(Comparator.comparingInt(p -> Integer.parseInt(p.getSeq())));

			int seqCounter = 1;
			for (ProcessFlowProcess p : group) {
				p.setProcessSeq(String.valueOf(seqCounter++));
			}
		}

		// DB 저장
		for (ProcessFlowProcess p : processList) {
			// 새 PK 생성
			String newId = egovProcessFlowProcessIdGnrService.getNextStringId();
			p.setFlowProcessId(newId);

			// DB insert
			processFlowDAO.insertProcessFlowProcess(p);
		}

	}

	@Override
	public List<ProcessFlowItem> selectItemByFlowId(String processFlowId) throws Exception {
		return processFlowDAO.selectItemByFlowId(processFlowId);
	}


//

	@Transactional
	@Override
	public void createProcessFlowItem(
			String processFlowId,
			List<ProcessFlowItem> itemList
	) throws Exception {

		try {
			for (ProcessFlowItem item : itemList) {

				String newId = egovProcessFlowItemIdGnrService.getNextStringId();
				item.setFlowItemId(newId);

				processFlowDAO.insertProcessFlowItem(item);
			}
		} catch (DataAccessException e) {
			Throwable root = e.getMostSpecificCause();

			if (root instanceof SQLException) {
				SQLException sqlEx = (SQLException) root;
				throw new BizException(sqlEx.getMessage());
			}

			throw new BizException("생산지시 저장 중 알 수 없는 오류가 발생했습니다. ");
		}



	}

	/* =========================
	 * 품목 삭제 (단건/다건)
	 * ========================= */
	@Override
	public void deleteProcessFlowItem(
			List<ProcessFlowItem> itemList
	) throws Exception {

		if (itemList == null || itemList.isEmpty()) return;

		for (ProcessFlowItem item : itemList) {
			if (item.getFlowItemId() == null) continue; // 안전장치
			processFlowDAO.deleteProcessFlowItemById(item.getFlowItemId());
		}
	}



//	@Transactional
//	@Override
//	public void createProcessFlowItem(
//			String processFlowId,
//			List<ProcessFlowItem> itemList
//	) throws Exception {
//
//		// 1) 빈 배열 ⇒ 전체 삭제 후 종료
//		if (itemList == null || itemList.isEmpty()) {
//			processFlowDAO.deleteProcessFlowItem(processFlowId);
//			return;
//		}
//
//		// 2) 기존 목록 조회
//		List<ProcessFlowItem> oldList = processFlowDAO.selectItemByFlowId(processFlowId);
//
//		// key 기준(예: flowItemCode)으로 Map 변환
//		Map<String, ProcessFlowItem> oldMap = oldList.stream()
//				.collect(Collectors.toMap(ProcessFlowItem::getFlowItemCode, x -> x));
//
//		Map<String, ProcessFlowItem> newMap = itemList.stream()
//				.collect(Collectors.toMap(ProcessFlowItem::getFlowItemCode, x -> x));
//
//		// 3) 삭제 대상: 기존에는 있었는데 FE에서는 없는 항목
//		List<ProcessFlowItem> toDelete = oldList.stream()
//				.filter(old -> !newMap.containsKey(old.getFlowItemCode()))
//				.collect(Collectors.toList());
//
//		// 4) 추가 대상: FE에는 있는데 기존에는 없던 항목
//		List<ProcessFlowItem> toInsert = itemList.stream()
//				.filter(newItem -> !oldMap.containsKey(newItem.getFlowItemCode()))
//				.collect(Collectors.toList());
//
//		// 5) 삭제 실행
//		for (ProcessFlowItem item : toDelete) {
//			processFlowDAO.deleteProcessFlowItemById(item.getFlowItemId());
//		}
//
//		// 6) 신규 추가 실행
//		for (ProcessFlowItem item : toInsert) {
//			String newId = egovProcessFlowItemIdGnrService.getNextStringId();
//			item.setFlowItemId(newId);
//
//			processFlowDAO.insertProcessFlowItem(item);
//		}
//
//	}

}
