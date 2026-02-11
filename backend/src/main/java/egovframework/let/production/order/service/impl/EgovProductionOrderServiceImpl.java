package egovframework.let.production.order.service.impl;

import egovframework.com.cmm.exception.BizException;
import egovframework.let.common.dto.ListResult;
import egovframework.let.production.order.domain.model.*;
import egovframework.let.production.order.domain.repository.ProductionOrderDAO;
import egovframework.let.production.order.service.EgovProductionOrderService;
import egovframework.let.production.order.service.ErpIFProdOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.javassist.runtime.DotClass;
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
@Slf4j
@Service("EgovProductionOrderService")
@RequiredArgsConstructor
public class EgovProductionOrderServiceImpl extends EgovAbstractServiceImpl implements EgovProductionOrderService {

	private final ProductionOrderDAO productionOrderDAO;
	private final ErpIFProdOrderService erpIfService;

	@Resource(name = "egovProdOrderIdGnrService")
	private EgovIdGnrService egovProdOrderIdGnrService;

	/**
	 * 조건에 맞는 생산지시 목록을 조회 한다.
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
	 * 메인 리스트
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
	 * DIALOG 리스트 (지시 전)
	 *
	 */
	@Override
	public ListResult<ProdOrderRow> selectFlowProcessByPlanId(ProdOrderSearchParam param) throws Exception{
		List<ProdOrderRow> list = productionOrderDAO.selectFlowProcessByPlanId(param);
		return new ListResult<>(list, 0);
	}

	/**
	 * 생산지시관리에서 생산id별 생산지시 조회
	 * DIALOG 리스트 (지시 후)
	 *
	 */
	@Override
	public ListResult<ProdOrderRow> selectProdOrdersByPlanId(ProdOrderSearchParam param) throws Exception{

		List<ProdOrderRow> list = productionOrderDAO.selectProdOrdersByPlanId(param);
		return new ListResult<>(list, 0);
	}


	/**
	 * 생산지시 저장
	 * MES 생산지시 저장
	 * ERP IF 데이터 전송
	 * 생산계획 ORDER_FLAG = ORDERED UPDATE
	 */
	@Override
	@Transactional
	public void insertProductionOrders(List<ProdOrderInsertDto> prodOrderList) throws Exception {

		List<ErpIFProdOrderDto> erpIfList = new ArrayList<>();

		for (ProdOrderInsertDto dto : prodOrderList) {
			// 생산지시 ID 채번
			String nextId = productionOrderDAO.selectProdOrderNextId();
			dto.setProdorderId(nextId);

			// WORK_SEQ 채번
			int orderSeq = productionOrderDAO.selectProdOrderWorkSeq(dto);
			dto.setOrderSeq(orderSeq);

			// DB insert
			productionOrderDAO.insertProductionOrder(dto);

			// ERP IF DTO 수집 (A)
			ErpIFProdOrderDto erpDto = convertInsertToIfDto(dto);
			erpIfList.add(erpDto);

		}

		// ERP IF 배치 전송
		try {
			erpIfService.sendProdOrderBatchToErp(erpIfList);
		} catch (Exception e) {
			// MES 트랜잭션 영향 X
			log.warn("[ERP IF][PROD ORDER][A][BATCH] 전송 실패. cnt={}", erpIfList.size(), e);
		}


		// 생산계획TPR301 ORDER_FLAG UPDATE
		if (!prodOrderList.isEmpty()) {
			ProdOrderInsertDto first = prodOrderList.get(0);
			updatePlanOrderFlag(
					first.getProdplanDate(),
					first.getProdplanSeq(),
					first.getProdworkSeq(),
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
	 * TPR504.DELETE_FLAG = 1 UPDATE
	 * ERP IF
	 * 생산계획 ORDER_FLAG = PLANNED UPDATE
	 */
	@Override
	@Transactional
	public void deleteProductionOrder(ProdOrderDeleteDto dto) throws Exception {

		// 삭제 전 등록된 생산실적이 있으면 삭제 안되게 처리
		int cnt = productionOrderDAO.selectProdResultCount(dto);
		if (cnt > 0) {
			throw new BizException("생산실적이 등록된 생산지시는 삭제할 수 없습니다.");
		}

		// ERP IF 전송
		try {
			ErpIFProdOrderDto erpDto = convertDeleteToIfDto(dto);
			erpIfService.sendProdOrderToErp(erpDto);
		} catch (Exception e) {
			// MES 트랜잭션 영향 주면 안 됨
			log.warn("[ERP IF][PROD ORDER][D] 전송 실패. prodOrderId={}", dto.getProdplanDate()+dto.getProdplanSeq()+dto.getProdworkSeq(), e);
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


	/**
	 * 선택한 여러 생산계획에 대해 생산지시를 일괄 생성
	 * 이미 지시된 계획은 제외
	 * MES 생산지시 저장
	 * ERP IF
	 * 생산계획 ORDER_FLAG = ORDERED UPDATE
	 */
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
			List<ErpIFProdOrderDto> ifList = createProductionOrders(plan, targets);
			erpIfService.sendProdOrderBatchToErp(ifList);

			// 4. 생산계획 order_flag 갱신 TPR301.ORDER_FLAG = ORDERED
			updatePlanOrderFlag(
					plan.getProdplanDate(),
					plan.getProdplanSeq(),
					plan.getProdworkSeq(),
					"ORDERED"
			);

		}

	}


	/**
	 * 선택한 여러 생산계획의 생산지시를 일괄 취소(삭제)
	 * 생산실적 존재 시 전체 취소 불가
	 * ERP IF
	 * TPR504.DELETE_FLAG = 1
	 * 생산계획 ORDER_FLAG = PLANNED
	 */
	@Override
	@Transactional
	public void bulkCancelProductionOrders(List<ProdPlanKeyDto> plans) throws Exception {
		if (plans == null || plans.isEmpty()) return;

		for (ProdPlanKeyDto plan : plans) {
			// 1. 생산실적 존재 여부 확인
			ProdOrderDeleteDto dto = new ProdOrderDeleteDto();
			dto.setProdplanDate(plan.getProdplanDate());
			dto.setProdplanSeq(plan.getProdplanSeq());
			dto.setProdworkSeq(plan.getProdworkSeq());
			dto.setOpmanCode(plan.getOpmanCode());
			int cnt = productionOrderDAO.selectProdResultCount(dto);
			if (cnt > 0) {
				throw new BizException("생산실적이 등록된 생산지시는 삭제할 수 없습니다. \n" +
						"생산지시번호 : "+plan.getProdplanId());
			}

			// 2. 생산지시 삭제
			productionOrderDAO.deleteProductionOrder(dto);

			// 3. 생산계획 order_flag 갱신 TPR301.ORDER_FLAG = PLANNED
			updatePlanOrderFlag(
					plan.getProdplanDate(),
					plan.getProdplanSeq(),
					plan.getProdworkSeq(),
					"PLANNED"
			);
		}

	}


	/**
	 * 해당 생산계획이 이미 생산지시 되었는지 여부 확인
	 */
	private boolean isAlreadyOrdered(ProdPlanKeyDto plan) throws Exception {
		return productionOrderDAO.selectProdPlanOrderedCount(plan) > 0;
	}

	/**
	 * 생산계획 기준으로 생산지시 생성 대상 공정 목록을 조회
	 */
	private List<ProdOrderRow> findInsertTargets(ProdPlanKeyDto plan) throws Exception {

		ProdOrderSearchParam param = new ProdOrderSearchParam();
		param.setProdplanDate(plan.getProdplanDate());
		param.setProdplanSeq(plan.getProdplanSeq());
		param.setProdworkSeq(plan.getProdworkSeq());

		List<ProdOrderRow> list = productionOrderDAO.selectFlowProcessByPlanId(param);
		return list != null ? list : Collections.emptyList();
	}

	/**
	 * 생산계획 + 공정 정보를 기반으로 생산지시 INSERT DTO를 생성한다.
	 */
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

	/**
	 * 생산계획 기준으로 여러 공정에 대한 생산지시를 생성하고
	 * ERP IF 전송용 DTO 목록을 반환한다.
	 */
	private List<ErpIFProdOrderDto> createProductionOrders(
			ProdPlanKeyDto plan,
			List<ProdOrderRow> targets
	) throws Exception {

		List<ErpIFProdOrderDto> erpIfList = new ArrayList<>();

		for (ProdOrderRow row : targets) {

			ProdOrderInsertDto dto = mapToInsertDto(plan, row);
			// 생산지시 ID 채번
			dto.setProdorderId(productionOrderDAO.selectProdOrderNextId());
			// WORK_SEQ 채번
			dto.setOrderSeq(productionOrderDAO.selectProdOrderWorkSeq(dto));
			// bulk는 정렬순서 front에서 못받으니 실제 순서로 세팅
			dto.setNewWorkorderSeq(plan.getProdworkSeq());
			// MES insert
			productionOrderDAO.insertProductionOrder(dto);

			// ERP IF DTO 수집 (A)
			erpIfList.add(convertInsertToIfDto(dto));
		}
		return erpIfList;
	}


	/**
	 * 생산계획(TPR301)의 ORDER_FLAG 값을 갱신한다.
	 * (PLANNED / ORDERED)
	 */
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

	/**
	 * 생산지시 INSERT 정보를 ERP IF (A) 전송용 DTO로 변환한다.
	 */
	private ErpIFProdOrderDto convertInsertToIfDto(ProdOrderInsertDto src) {
		ErpIFProdOrderDto dto = new ErpIFProdOrderDto();

		dto.setWorkingTag("A");
		dto.setRegEmpId("SYSTEM");

		dto.setMesIfKey(src.getProdorderId());

		dto.setWorkOrderSeq(src.getProdworkSeq());
		dto.setWorkOrderSerl(src.getProdworkSeq());

		dto.setFactUnit(1);
		dto.setWorkOrderNo(src.getProdorderId());
		dto.setWorkOrderDate(src.getProdplanDate());

		dto.setProdPlanSeq(src.getProdplanSeq());
		dto.setWorkCenterSeq(1);
		dto.setGoodItemSeq(src.getItemCodeId());
		dto.setProcSeq(0); //dto.setProcSeq(src.getOrderSeq());
		dto.setProdUnitSeq(0);

		dto.setOrderQty(src.getOrderQty());

		dto.setDeptSeq(0);
		dto.setEmpSeq(0);
		dto.setProcRev("");
		dto.setRemark(src.getBigo());

		return dto;
	}

	/**
	 * 생산지시 DELETE 정보를 ERP IF (D) 전송용 DTO로 변환한다.
	 */
	private ErpIFProdOrderDto convertDeleteToIfDto(ProdOrderDeleteDto src) {

		ErpIFProdOrderDto dto = new ErpIFProdOrderDto();

		// 처리구분
		dto.setWorkingTag("D");

		// 등록자
		dto.setRegEmpId("SYSTEM");

		// MES 연동키
		dto.setMesIfKey(src.getProdorderId());

		dto.setWorkOrderSeq(src.getProdworkSeq());
		dto.setWorkOrderSerl(src.getProdworkSeq());

		// 기본값
		dto.setFactUnit(1);
		dto.setWorkOrderNo(src.getProdorderId());
		dto.setWorkOrderDate(src.getProdplanDate()); // YYYYMMDD

		dto.setProdPlanSeq(src.getProdplanSeq());
		dto.setWorkCenterSeq(1);          // 고정 or 매핑
		dto.setGoodItemSeq(0);
		dto.setProcSeq(0);
		dto.setProdUnitSeq(0);

		dto.setOrderQty(0);

		dto.setDeptSeq(0);
		dto.setEmpSeq(0);
		dto.setProcRev("");
		dto.setRemark("");

		return dto;
	}


}
