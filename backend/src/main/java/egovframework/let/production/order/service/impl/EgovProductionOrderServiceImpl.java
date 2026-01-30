package egovframework.let.production.order.service.impl;

import egovframework.com.cmm.exception.DbExceptionTranslator;
import egovframework.let.common.dto.ListResult;
import egovframework.let.production.order.domain.model.*;
import egovframework.let.production.order.domain.repository.ProductionOrderDAO;
import egovframework.let.production.order.service.EgovProductionOrderService;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.egovframe.rte.fdl.idgnr.EgovIdGnrService;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
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
	public ListResult<ProdPlanRow> selectProdPlans(ProdPlanSearchParam param) throws Exception{

		List<ProdPlanRow> list = productionOrderDAO.selectProdPlans(param);
		int resultCnt = productionOrderDAO.selectProdPlanCount(param);

		return new ListResult<>(list, resultCnt);
	}

	/**
	 * 생산지시관리에서 품목별 공정 조회시
	 *
	 */
	@Override
	public Map<String, Object> selectFlowProcessByPlanId(ProdOrderSearchParam param) throws Exception{
		List<ProdOrderRow> list = productionOrderDAO.selectFlowProcessByPlanId(param);

		Map<String, Object> result = new HashMap<>();
		result.put("resultList", list);
		return result;
	}

	/**
	 * 생산지시관리에서 생산id별 생산지시 조회
	 *
	 */
	@Override
	public Map<String, Object> selectProdOrdersByPlanId(ProdOrderSearchParam param) throws Exception{

		List<ProdOrderRow> list = productionOrderDAO.selectProdOrdersByPlanId(param);
		Map<String, Object> result = new HashMap<>();
		result.put("resultList", list);
		return result;
	}


	/**
	 * 생산지시 저장
	 */
	@Override
	@Transactional
	public void insertProductionOrders(List<ProdOrderInsertDto> prodOrderList) throws Exception {

		try{
			for (ProdOrderInsertDto dto : prodOrderList) {
				// 생산지시 ID 채번
				String nextId = productionOrderDAO.selectProdOrderNextId();
				dto.setProdorderId(nextId);

				// WORK_SEQ 채번
				int orderSeq = productionOrderDAO.selectProdOrderWorkSeq(dto);
				dto.setOrderSeq(orderSeq);

				// DB insert
				productionOrderDAO.insertProductionOrder(dto);

				// 생산계획TPR301 ORDER_FLAG UPDATE
				ProdPlanOrderFlagDto flagDto = new ProdPlanOrderFlagDto();
				flagDto.setProdplanDate(dto.getProdplanDate());
				flagDto.setProdplanSeq(dto.getProdplanSeq());
				flagDto.setProdworkSeq(dto.getProdworkSeq());
				flagDto.setOrderFlag("ORDERED");
				productionOrderDAO.updateProdPlanOrderFlag(flagDto);
			}
		} catch (DataAccessException e) {
			throw DbExceptionTranslator.translate(e);
		}
	}


	/**
	 * 생산지시 수정
	 */
	@Override
	@Transactional
	public void updateProductionOrders(List<ProdOrderUpdateDto> prodOrderList) throws Exception {
		for(ProdOrderUpdateDto dto : prodOrderList){
			try {
				productionOrderDAO.updateProductionOrder(dto);
			} catch (Exception e){
				Throwable cause = e.getCause();

				if (cause instanceof com.microsoft.sqlserver.jdbc.SQLServerException) {
					throw new IllegalStateException(cause.getMessage());
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
	public void deleteProductionOrder(ProdOrderDeleteDto dto) throws Exception {

		// 삭제 전 등록된 생산실적이 있으면 삭제 안되게 처리
		int cnt = productionOrderDAO.selectProdResultCount(dto);
		if (cnt > 0) {
			throw new IllegalStateException("생산실적이 등록된 생산지시는 삭제할 수 없습니다.");
		}

		// 삭제
		productionOrderDAO.deleteProductionOrder(dto);

		// 생산계획TPR301 ORDER_FLAG UPDATE
		ProdPlanOrderFlagDto flagDto = new ProdPlanOrderFlagDto();
		flagDto.setProdplanDate(dto.getProdplanDate());
		flagDto.setProdplanSeq(dto.getProdplanSeq());
		flagDto.setProdworkSeq(dto.getProdworkSeq());
		flagDto.setOrderFlag("PLANNED");
		productionOrderDAO.updateProdPlanOrderFlag(flagDto);
	}




}
