package egovframework.let.production.result.service.impl;

import egovframework.com.cmm.LoginVO;
import egovframework.let.production.result.domain.model.ProductionResult;
import egovframework.let.production.result.domain.repository.ProductionResultDAO;
import egovframework.let.production.result.service.EgovProductionResultService;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.egovframe.rte.fdl.idgnr.EgovIdGnrService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.transaction.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 생산계획 관리를 위한 서비스 구현 클래스
 * @author SHMT-MES
 * @since 2025.11.21
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.11.21 SHMT-MES          최초 생성
 *
 * </pre>
 */
@Service("egovProductionResultService")
@RequiredArgsConstructor
public class EgovProductionResultServiceImpl extends EgovAbstractServiceImpl implements EgovProductionResultService {

	private final ProductionResultDAO productionResultDAO;

//	@Resource(name = "egovProdResultIdGnrService")
//	private EgovIdGnrService egovProdPlanIdgenService;

	@Override
	public Map<String, Object> selectProductionOrderList(Map<String, String> searchVO, LoginVO user) throws Exception {

		int page = Integer.parseInt(searchVO.getOrDefault("page", "0"));
		int size = Integer.parseInt(searchVO.getOrDefault("size", "10"));

		Map<String, Object> dbParams = new HashMap<>(searchVO);
		dbParams.put("offset", page * size);
		dbParams.put("size", size);

		List<Map<String, Object>> resultList = productionResultDAO.selectProductionOrderList(dbParams);
		int totalCount = productionResultDAO.selectProductionOrderListCount(dbParams);

		Map<String, Object> result = new HashMap<>();
		result.put("resultList", resultList );
		result.put("totalCount", String.valueOf(totalCount));
		result.put("user", user);

		return result;
	}

	@Override
	@Transactional
	public void insertProductionResult(List<Map<String, Object>> resultList) throws Exception {
		for(Map<String, Object> resultMap : resultList){
			if("new".equals(resultMap.get("TPR601ID"))){
				// 저장일자의 max TPR601ID 값 가져오기
				String nextId = productionResultDAO.selectProdResultNextId();
				resultMap.put("TPR601ID", nextId);

				// prod_seq 값 가져오기
				Integer prod_seq = productionResultDAO.selectProdSeq(resultMap);
				resultMap.put("PROD_SEQ", prod_seq);

				// TPR601 저장
				productionResultDAO.insertProductionResult(resultMap);

				// TPR601W 저장

				// TPR601M 저장

				// TPR504 ORDER_FLAG UPDATE
//				resultMap.put("ORDER_FLAG", 'P');
//				productionResultDAO.updateProdOrderOrderFlag(resultMap);
			}

		}
	}

	@Override
	public Map<String, Object> selectProductionResultDetailList(Map<String, Object> searchVO, LoginVO user) throws Exception {

		List<Map<String, Object>> resultList = productionResultDAO.selectProductionResultDetailList(searchVO);

		Map<String, Object> result = new HashMap<>();
		result.put("resultList", resultList );
		result.put("user", user);

		return result;
	}

}
