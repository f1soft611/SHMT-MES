package egovframework.let.production.plan.service;

import egovframework.com.cmm.LoginVO;
import egovframework.let.production.plan.domain.model.ProductionPlan;
import egovframework.let.production.plan.domain.model.ProductionPlanMaster;
import egovframework.let.production.plan.domain.model.ProductionPlanVO;

import java.util.List;
import java.util.Map;

/**
 * 생산계획 관리를 위한 서비스 인터페이스
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
public interface EgovProductionPlanService {

	/**
	 * 생산계획을 등록한다. (마스터 + 상세 트랜잭션 처리)
	 * @param master 생산계획 마스터 정보
	 * @param planList 생산계획 상세 목록
	 * @return 등록된 계획번호
	 * @throws Exception
	 */
	String insertProductionPlan(ProductionPlanMaster master, List<ProductionPlan> planList) throws Exception;

	/**
	 * 생산계획 마스터 목록을 조회한다.
	 * @param searchVO 검색 조건
	 * @param user 사용자 VO
	 * @return 생산계획 마스터 목록과 총 건수
	 * @throws Exception
	 */
	Map<String, Object> selectProductionPlanMasterList(ProductionPlanVO searchVO, LoginVO user) throws Exception;

	/**
	 * 생산계획 상세 목록을 조회한다.
	 * @param searchVO 검색 조건
	 * @param userId 사용자 ID
	 * @return 생산계획 상세 목록
	 * @throws Exception
	 */
	List<ProductionPlan> selectProductionPlanList(ProductionPlanVO searchVO, String userId) throws Exception;

	/**
	 * 생산계획 상세를 조회한다.
	 * @param plan 조회 조건
	 * @return 생산계획 상세 정보
	 * @throws Exception
	 */
	ProductionPlan selectProductionPlan(ProductionPlan plan) throws Exception;

	/**
	 * 계획번호로 생산계획 상세 목록을 조회한다.
	 * @param planNo 계획번호
	 * @return 생산계획 상세 목록
	 * @throws Exception
	 */
	List<ProductionPlan> selectProductionPlanByPlanNo(String planNo) throws Exception;

	/**
	 * 생산계획을 수정한다. (마스터 + 상세 트랜잭션 처리)
	 * @param master 생산계획 마스터 정보
	 * @param planList 생산계획 상세 목록
	 * @throws Exception
	 */
	void updateProductionPlan(ProductionPlanMaster master, List<ProductionPlan> planList) throws Exception;

	/**
	 * 생산계획을 삭제한다. (마스터 삭제 시 상세도 함께 삭제)
	 * @param master 생산계획 마스터 정보
	 * @throws Exception
	 */
	void deleteProductionPlan(ProductionPlanMaster master) throws Exception;

	/**
	 * 작업장별 주간 생산계획을 조회한다. (설비별 그룹화)
	 * @param searchVO 검색 조건 (workplaceCode, startDate, endDate 필수)
	 * @return 설비별 주간 계획 데이터
	 * @throws Exception
	 */
	Map<String, Object> selectWeeklyProductionPlans(ProductionPlanVO searchVO) throws Exception;
}
