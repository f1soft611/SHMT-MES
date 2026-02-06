package egovframework.let.production.order.service.impl;

import egovframework.com.cmm.exception.BizException;
import egovframework.let.common.dto.ListResult;
import egovframework.let.production.order.domain.model.*;
import egovframework.let.production.order.domain.repository.ProductionOrderDAO;
import egovframework.let.production.order.service.EgovProductionOrderService;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.egovframe.rte.fdl.idgnr.EgovIdGnrService;
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
	public ListResult<ProdOrderRow> selectFlowProcessByPlanId(ProdOrderSearchParam param) throws Exception{
		List<ProdOrderRow> list = productionOrderDAO.selectFlowProcessByPlanId(param);
		return new ListResult<>(list, 0);
	}

	/**
	 * 생산지시관리에서 생산id별 생산지시 조회
	 *
	 */
	@Override
	public ListResult<ProdOrderRow> selectProdOrdersByPlanId(ProdOrderSearchParam param) throws Exception{

		List<ProdOrderRow> list = productionOrderDAO.selectProdOrdersByPlanId(param);
		return new ListResult<>(list, 0);
	}


	/**
	 * 생산지시 저장
	 */
	@Override
	@Transactional
	public void insertProductionOrders(List<ProdOrderInsertDto> prodOrderList) throws Exception {

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
			updatePlanOrderFlag(
					dto.getProdplanDate(),
					dto.getProdplanSeq(),
					dto.getProdworkSeq(),
					"ORDERED"
			);
		}
	}


	/**
	 * 생산지시 수정
	 */
	@Override
	@Transactional
	public void updateProductionOrders(List<ProdOrderUpdateDto> prodOrderList) throws Exception {
		for(ProdOrderUpdateDto dto : prodOrderList){
			productionOrderDAO.updateProductionOrder(dto);
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
			throw new BizException("생산실적이 등록된 생산지시는 삭제할 수 없습니다.");
		}

		// 삭제
		productionOrderDAO.deleteProductionOrder(dto);

		// 생산계획TPR301 ORDER_FLAG UPDATE
		updatePlanOrderFlag(
				dto.getProdplanDate(),
				dto.getProdplanSeq(),
				dto.getProdworkSeq(),
				"PLANNED"
		);
	}

	@Override
	@Transactional
	public void bulkCreateProductionOrders(List<ProdPlanKeyDto> plans) throws Exception {
		if (plans == null || plans.isEmpty()) return;

		for (ProdPlanKeyDto plan : plans) {

			// 1. 이미 생산 지시된 계획인지 체크
			// 이미 지시되어있으면 다음계획으로 이동
			if (isAlreadyOrdered(plan)) {
				continue;
			}

			// 2. 생산계획 기준 지시대상 공정 조회
			List<ProdOrderRow> targets = findInsertTargets(plan);
			if (targets.isEmpty()) {
				continue;
			}

			// 3. 생산지시 저장
			createProductionOrders(plan, targets);

			// 4. 생산계획 order_flag 갱신 TPR301.ORDER_FLAG = ORDERED
			updatePlanOrderFlag(
					plan.getProdplanDate(),
					plan.getProdplanSeq(),
					plan.getProdworkSeq(),
					"ORDERED"
			);

		}

	}



	private boolean isAlreadyOrdered(ProdPlanKeyDto plan) throws Exception {
		return productionOrderDAO.selectProdPlanOrderedCount(plan) > 0;
	}

	private List<ProdOrderRow> findInsertTargets(ProdPlanKeyDto plan) throws Exception {

		ProdOrderSearchParam param = new ProdOrderSearchParam();
		param.setProdplanDate(plan.getProdplanDate());
		param.setProdplanSeq(plan.getProdplanSeq());
		param.setProdworkSeq(plan.getProdworkSeq());

		List<ProdOrderRow> list = productionOrderDAO.selectFlowProcessByPlanId(param);
		return list != null ? list : Collections.emptyList();
	}

	private ProdOrderInsertDto mapToInsertDto(
			ProdPlanKeyDto plan,
			ProdOrderRow row
	) {

		ProdOrderInsertDto dto = new ProdOrderInsertDto();

		dto.setProdplanDate(row.getProdplanDate());
		dto.setProdplanSeq(row.getProdplanSeq());
		dto.setProdworkSeq(row.getProdworkSeq());
		dto.setProdplanId(row.getProdplanId());

		dto.setWorkCode(row.getWorkCode());
		dto.setWorkdtDate(row.getWorkdtDate());

		dto.setItemCodeId(row.getItemCodeId());
		dto.setProdCodeId(row.getProdCodeId());
		dto.setEquipmentCode(row.getEquipmentCode());

		dto.setLotNo(row.getLotNo());
		dto.setOrderQty(row.getOrderQty());

		dto.setOpmanCode(plan.getOpmanCode());
		dto.setTpr110dSeq(row.getTpr110dSeq());

		return dto;
	}

	private void createProductionOrders(
			ProdPlanKeyDto plan,
			List<ProdOrderRow> targets
	) throws Exception {

		for (ProdOrderRow row : targets) {
			ProdOrderInsertDto dto = mapToInsertDto(plan, row);

			dto.setProdorderId(productionOrderDAO.selectProdOrderNextId());
			dto.setOrderSeq(productionOrderDAO.selectProdOrderWorkSeq(dto));

			productionOrderDAO.insertProductionOrder(dto);
		}
	}

	private void updatePlanOrderFlag(
			String prodplanDate,
			int prodplanSeq,
			int prodworkSeq,
			String orderFlag
	) {

		ProdPlanOrderFlagDto flagDto = new ProdPlanOrderFlagDto();
		flagDto.setProdplanDate(prodplanDate);
		flagDto.setProdplanSeq(prodplanSeq);
		flagDto.setProdworkSeq(prodworkSeq);
		flagDto.setOrderFlag(orderFlag);

		productionOrderDAO.updateProdPlanOrderFlag(flagDto);
	}

}
