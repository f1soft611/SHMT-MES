package egovframework.let.production.order.service.impl;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.service.EgovFileMngService;
import egovframework.com.cmm.service.FileVO;
import egovframework.let.cop.bbs.domain.model.Board;
import egovframework.let.cop.bbs.domain.model.BoardVO;
import egovframework.let.cop.bbs.domain.repository.BBSManageDAO;
import egovframework.let.cop.bbs.dto.request.BbsManageDeleteBoardRequestDTO;
import egovframework.let.cop.bbs.service.EgovBBSManageService;
import egovframework.let.production.order.domain.model.ProductionOrderVO;
import egovframework.let.production.order.domain.repository.ProductionOrderDAO;
import egovframework.let.production.order.service.EgovProductionOrderService;
import egovframework.let.utl.fcc.service.EgovDateUtil;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.egovframe.rte.fdl.idgnr.EgovIdGnrService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 생산 지시 관리를 위한 서비스 구현 클래스
 * @author 김기형
 * @since 2025.07.22
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.07.22 김기형          최초 생성
 *
 * </pre>
 */
@Service("EgovProductionOrderService")
@RequiredArgsConstructor
public class EgovProductionOrderServiceImpl extends EgovAbstractServiceImpl implements EgovProductionOrderService {

	private final ProductionOrderDAO productionOrderDAO;

	@Resource(name = "egovProdOrderIdGnrService")
	private EgovIdGnrService egovProdOrderIdGnrService;

	/**
	 * 조건에 맞는 게시물 목록을 조회 한다.
	 *
	 * @see egovframework.let.production.order.service.EgovProductionOrderService#selectProductionOrderList(ProductionOrderVO, String) (ProductionOrderVO, String)
	 */
	@Override
	public Map<String, Object> selectProductionOrderList(ProductionOrderVO productionOrderVO, String attrbFlag) throws Exception {

//		List<ProductionOrderVO> list = productionOrderDAO.selectProductionOrderList(productionOrderVO);

		List<ProductionOrderVO> result = new ArrayList<ProductionOrderVO>();

//		int cnt = productionOrderDAO.selectProductionOrderListCnt(productionOrderVO);
		int cnt = 1;

		Map<String, Object> map = new HashMap<String, Object>();

		map.put("resultList", result);
		map.put("resultCnt", Integer.toString(cnt));

		return map;
	}


	/**
	 * 생산지시관리에서 생산계획 조회시 사용
	 *
	 */
	@Override
	public Map<String, Object> selectProdPlans(Map<String, String> params) throws Exception{

		int page = Integer.parseInt(params.getOrDefault("page", "0"));
		int size = Integer.parseInt(params.getOrDefault("size", "10"));

		Map<String, Object> dbParams = new HashMap<>(params);
		dbParams.put("offset", page * size);
		dbParams.put("size", size);

		List<Map<String, Object>> list = productionOrderDAO.selectProdPlans(dbParams);
		int totalCount = productionOrderDAO.selectProdPlanCount(dbParams);

		Map<String, Object> result = new HashMap<>();
		result.put("resultList", list);
		result.put("totalCount", totalCount);

		return result;
	}

	/**
	 * 생산지시관리에서 품목별 공정 조회시
	 *
	 */
	@Override
	public List<Map<String, Object>> selectFlowProcessByPlanId(String prodPlanId) throws Exception{
		return productionOrderDAO.selectFlowProcessByPlanId(prodPlanId);
	}

	/**
	 * 생산지시관리에서 생산id별 생산지시 조회
	 *
	 */
	@Override
	public List<Map<String, Object>> selectProdOrdersByPlanId(String prodPlanId) throws Exception{
		return productionOrderDAO.selectProdOrdersByPlanId(prodPlanId);
	}


	/**
	 * 생산지시 저장
	 */
	@Override
	@Transactional
	public void insertProductionOrders(List<Map<String, Object>> prodOrderList) throws Exception {
		for(Map<String, Object> prodOrder : prodOrderList){
			try {
				String newId = egovProdOrderIdGnrService.getNextStringId();
				prodOrder.put("PRODORDER_ID", newId);

				int orderSeq = productionOrderDAO.selectProdOrderWorkSeq(prodOrder);
				prodOrder.put("ORDER_SEQ", orderSeq);

				// DB insert
				productionOrderDAO.insertProductionOrder(prodOrder);

				// 생산계획TPR301M ORDER_FLAG UPDATE
				prodOrder.put("ORDER_FLAG", "ORDERED");
				productionOrderDAO.updateProdPlanOrderFlag(prodOrder);
			} catch (Exception e){
				Throwable cause = e.getCause();

				if (cause instanceof com.microsoft.sqlserver.jdbc.SQLServerException) {
					com.microsoft.sqlserver.jdbc.SQLServerException sqlEx =
							(com.microsoft.sqlserver.jdbc.SQLServerException) cause;

					throw new IllegalStateException(sqlEx.getMessage());
				}

				throw e;
			}
		}
	}

	/**
	 * 생산지시 수정
	 */
	@Override
	@Transactional
	public void updateProductionOrders(List<Map<String, Object>> prodOrderList) throws Exception {
		for(Map<String, Object> prodOrder : prodOrderList){
			try {
				productionOrderDAO.updateProductionOrder(prodOrder);
			} catch (Exception e){
				Throwable cause = e.getCause();

				if (cause instanceof com.microsoft.sqlserver.jdbc.SQLServerException) {
					com.microsoft.sqlserver.jdbc.SQLServerException sqlEx =
							(com.microsoft.sqlserver.jdbc.SQLServerException) cause;

					throw new IllegalStateException(sqlEx.getMessage());
				}

				throw e;
			}
		}
	}


	/**
	 * 생산지시 삭제
	 */
	@Override
	@Transactional
	public void deleteProductionOrder(Map<String, Object> prodOrder) throws Exception {

		// 삭제 전 등록된 생산실적이 있으면 삭제 안되게 처리
		int cnt = productionOrderDAO.selectProdResultCount(prodOrder);
		if (cnt > 0) {
			throw new IllegalStateException("생산실적이 등록된 생산지시는 삭제할 수 없습니다.");
		}

		// 삭제
		productionOrderDAO.deleteProductionOrder(prodOrder);

		// 생산계획TPR301M ORDER_FLAG UPDATE
		prodOrder.put("ORDER_FLAG", "PLANNED");
		productionOrderDAO.updateProdPlanOrderFlag(prodOrder);
	}




}
