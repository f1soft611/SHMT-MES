package egovframework.let.production.plan.service.impl;

import egovframework.com.cmm.LoginVO;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.egovframe.rte.fdl.idgnr.EgovIdGnrService;
import egovframework.let.production.plan.domain.model.ProductionPlan;
import egovframework.let.production.plan.domain.model.ProductionPlanMaster;
import egovframework.let.production.plan.domain.model.ProductionPlanVO;
import egovframework.let.production.plan.domain.model.ProductionPlanReference;
import egovframework.let.production.plan.domain.repository.ProductionPlanDAO;
import egovframework.let.production.plan.service.EgovProductionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.math.BigDecimal;
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
@Service("egovProductionPlanService")
@RequiredArgsConstructor
public class EgovProductionPlanServiceImpl extends EgovAbstractServiceImpl implements EgovProductionPlanService {

	private final ProductionPlanDAO productionPlanDAO;

	@Resource(name = "egovProdPlanIdGnrService")
	private EgovIdGnrService egovProdPlanIdgenService;

	/**
	 * 생산계획을 등록한다. (마스터 + 상세 트랜잭션 처리)
	 */
	@Override
	@Transactional
	public String insertProductionPlan(ProductionPlanMaster master, List<ProductionPlan> planList) throws Exception {
		String planId = egovProdPlanIdgenService.getNextStringId();
		master.setProdPlanId(planId);
		
		// prodPlanDate 설정 (planDate와 동일하게)
		master.setProdPlanDate(master.getPlanDate());
		
		// 총 계획수량 계산
		BigDecimal totalQty = BigDecimal.ZERO;
		for (ProductionPlan plan : planList) {
			totalQty = totalQty.add(plan.getPlannedQty());
		}
		master.setTotalPlanQty(totalQty);
		
		// 마스터 등록
		productionPlanDAO.insertProductionPlanMaster(master);
		
		// 상세 등록
		for (ProductionPlan plan : planList) {
			plan.setFactoryCode(master.getFactoryCode());
			plan.setProdPlanId(planId);
			plan.setProdPlanDate(master.getProdPlanDate());
			plan.setProdPlanSeq(master.getProdPlanSeq());
			productionPlanDAO.insertProductionPlan(plan);
		}
		
		return planId;
	}

	/**
	 * 생산계획 마스터 목록을 조회한다.
	 */
	@Override
	public Map<String, Object> selectProductionPlanMasterList(ProductionPlanVO searchVO, LoginVO user) throws Exception {
		List<ProductionPlanMaster> resultList = productionPlanDAO.selectProductionPlanMasterList(searchVO);
		int totCnt = productionPlanDAO.selectProductionPlanMasterListTotCnt(searchVO);
		
		Map<String, Object> map = new HashMap<>();
		map.put("resultList", resultList);
		map.put("resultCnt", String.valueOf(totCnt));
		map.put("user", user);
		
		return map;
	}

	/**
	 * 생산계획 상세 목록을 조회한다.
	 */
	@Override
	public List<ProductionPlan> selectProductionPlanList(ProductionPlanVO searchVO, String userId) throws Exception {
		return productionPlanDAO.selectProductionPlanList(searchVO);
	}

	/**
	 * 생산계획 상세를 조회한다.
	 */
	@Override
	public ProductionPlan selectProductionPlan(ProductionPlan plan) throws Exception {
		return productionPlanDAO.selectProductionPlan(plan);
	}

	/**
	 * 계획번호로 생산계획 상세 목록을 조회한다.
	 */
	@Override
	public List<ProductionPlan> selectProductionPlanByPlanNo(String planNo) throws Exception {
		return productionPlanDAO.selectProductionPlanByPlanNo(planNo);
	}

	/**
	 * 생산계획을 수정한다. (마스터 + 상세 트랜잭션 처리)
	 */
	@Override
	@Transactional
	public void updateProductionPlan(ProductionPlanMaster master, List<ProductionPlan> planList) throws Exception {
		// 총 계획수량 재계산
		BigDecimal totalQty = BigDecimal.ZERO;
		for (ProductionPlan plan : planList) {
			totalQty = totalQty.add(plan.getPlannedQty());
		}
		master.setTotalPlanQty(totalQty);
		
		// 마스터 수정
		productionPlanDAO.updateProductionPlanMaster(master);
		
		// 상세 수정
		for (ProductionPlan plan : planList) {
			productionPlanDAO.updateProductionPlan(plan);
		}
	}

	/**
	 * 생산계획을 삭제한다. (마스터 삭제 시 상세도 함께 논리적 삭제)
	 */
	@Override
	@Transactional
	public void deleteProductionPlan(ProductionPlanMaster master) throws Exception {
		// 마스터 논리적 삭제 (USE_YN = 'N' 설정)
		// 상세 데이터는 외래키 CASCADE 옵션에 의해 함께 논리적 삭제됨
		productionPlanDAO.deleteProductionPlanMaster(master);
	}

	/**
	 * 작업장별 주간 생산계획을 조회한다. (설비별 그룹화)
	 */
	@Override
	public Map<String, Object> selectWeeklyProductionPlans(ProductionPlanVO searchVO) throws Exception {
		// 1. DB에서 설비 및 계획 데이터 조회
		List<Object> rawData = productionPlanDAO.selectWeeklyProductionPlansByWorkplace(searchVO);
		
		// 2. 설비별로 그룹화
		Map<String, egovframework.let.production.plan.domain.model.ProductionPlanWeeklyDTO.EquipmentWeeklyPlan> equipmentMap = new java.util.LinkedHashMap<>();
		
		for (Object obj : rawData) {
			@SuppressWarnings("unchecked")
			Map<String, Object> row = (Map<String, Object>) obj;

			String workplaceCode = (String) row.get("workplaceCode");
			String processCode = (String) row.get("processCode");
			String equipmentCode = (String) row.get("equipmentCode");
			String equipmentName = (String) row.get("equipmentName");
			String equipmentId = (String) row.get("equipmentId");
			
			// 설비가 처음 등장하면 초기화
			if (!equipmentMap.containsKey(equipmentCode)) {
				egovframework.let.production.plan.domain.model.ProductionPlanWeeklyDTO.EquipmentWeeklyPlan equipPlan = 
					egovframework.let.production.plan.domain.model.ProductionPlanWeeklyDTO.EquipmentWeeklyPlan.builder()
						.workplaceCode(workplaceCode)
						.processCode(processCode)
						.equipmentCode(equipmentCode)
						.equipmentName(equipmentName)
						.equipmentId(equipmentId)
						.weeklyPlans(new java.util.LinkedHashMap<>())
						.build();
				equipmentMap.put(equipmentCode, equipPlan);
			}
			
			// 계획 데이터가 있는 경우만 추가
			if (row.get("prodPlanId") != null) {
				System.out.println("1111111111111111111111111111111111111111");
				String planDate = (String) row.get("planDate");
				
				// YYYYMMDD -> YYYY-MM-DD 변환
				String formattedDate = planDate.substring(0, 4) + "-" + 
									   planDate.substring(4, 6) + "-" + 
									   planDate.substring(6, 8);
				
				// DailyPlan 생성
				egovframework.let.production.plan.domain.model.ProductionPlanWeeklyDTO.DailyPlan dailyPlan = 
					egovframework.let.production.plan.domain.model.ProductionPlanWeeklyDTO.DailyPlan.builder()
						.planId((String) row.get("prodPlanId"))
						.planSeq((Integer) row.get("planSeq"))
						.planDate(planDate)
						.itemCode((String) row.get("itemCode"))
//						.itemName((String) row.get("itemName"))
//						.plannedQty(row.get("plannedQty") != null ? ((Number) row.get("plannedQty")).doubleValue() : 0.0)
//						.actualQty(row.get("actualQty") != null ? ((Number) row.get("actualQty")).doubleValue() : 0.0)
//						.shift((String) row.get("shift"))
//						.workerCode((String) row.get("workerCode"))
//						.workerName((String) row.get("workerName"))
//						.orderNo((String) row.get("orderNo"))
//						.orderSeqno((Integer) row.get("orderSeqno"))
//						.orderHistno((Integer) row.get("orderHistno"))
//						.customerCode((String) row.get("customerCode"))
//						.customerName((String) row.get("customerName"))
//						.remark((String) row.get("remark"))
						.build();
				
				// 날짜별 계획 리스트에 추가
				egovframework.let.production.plan.domain.model.ProductionPlanWeeklyDTO.EquipmentWeeklyPlan equipPlan = equipmentMap.get(equipmentCode);
				equipPlan.getWeeklyPlans()
					.computeIfAbsent(formattedDate, k -> new java.util.ArrayList<>())
					.add(dailyPlan);
			}
		}
		
		// 3. 결과 반환
		Map<String, Object> result = new HashMap<>();
		result.put("equipmentPlans", new java.util.ArrayList<>(equipmentMap.values()));
		
		return result;
	}
}
