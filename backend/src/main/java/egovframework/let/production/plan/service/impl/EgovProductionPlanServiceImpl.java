package egovframework.let.production.plan.service.impl;

import egovframework.com.cmm.service.EgovIdGnrService;
import egovframework.let.production.plan.domain.model.ProductionPlan;
import egovframework.let.production.plan.domain.model.ProductionPlanMaster;
import egovframework.let.production.plan.domain.model.ProductionPlanVO;
import egovframework.let.production.plan.domain.repository.ProductionPlanDAO;
import egovframework.let.production.plan.service.EgovProductionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
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
public class EgovProductionPlanServiceImpl implements EgovProductionPlanService {

	// 계획번호 생성 상수
	private static final String PLAN_NO_PREFIX = "PL";
	private static final String PLAN_NO_DATE_FORMAT = "yyyyMMdd";
	private static final int PLAN_NO_SEQUENCE_LENGTH = 4;

	private final ProductionPlanDAO productionPlanDAO;

	@Resource(name = "egovIdGnrService")
	private EgovIdGnrService idgenService;

	/**
	 * 생산계획을 등록한다. (마스터 + 상세 트랜잭션 처리)
	 */
	@Override
	@Transactional
	public String insertProductionPlan(ProductionPlanMaster master, List<ProductionPlan> planList) throws Exception {
		// 계획번호 생성 (날짜 + 시퀀스)
		SimpleDateFormat sdf = new SimpleDateFormat(PLAN_NO_DATE_FORMAT);
		String dateStr = sdf.format(new Date());
		String planNo = PLAN_NO_PREFIX + dateStr + String.format("%0" + PLAN_NO_SEQUENCE_LENGTH + "d", 
				idgenService.getNextIntegerId("TPR301M"));
		
		master.setPlanNo(planNo);
		
		// 총 계획수량 계산
		BigDecimal totalQty = BigDecimal.ZERO;
		for (ProductionPlan plan : planList) {
			totalQty = totalQty.add(plan.getPlannedQty());
		}
		master.setTotalPlanQty(totalQty);
		
		// 마스터 등록
		productionPlanDAO.insertProductionPlanMaster(master);
		
		// 상세 등록
		int seq = 1;
		for (ProductionPlan plan : planList) {
			plan.setPlanNo(planNo);
			plan.setPlanSeq(seq++);
			plan.setFactoryCode(master.getFactoryCode());
			productionPlanDAO.insertProductionPlan(plan);
		}
		
		return planNo;
	}

	/**
	 * 생산계획 마스터 목록을 조회한다.
	 */
	@Override
	public Map<String, Object> selectProductionPlanMasterList(ProductionPlanVO searchVO, String userId) throws Exception {
		List<ProductionPlanMaster> resultList = productionPlanDAO.selectProductionPlanMasterList(searchVO);
		int totCnt = productionPlanDAO.selectProductionPlanMasterListTotCnt(searchVO);
		
		Map<String, Object> map = new HashMap<>();
		map.put("resultList", resultList);
		map.put("resultCnt", String.valueOf(totCnt));
		
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
}
