package egovframework.let.production.plan.domain.repository;

import egovframework.let.production.plan.domain.model.ProductionPlan;
import egovframework.let.production.plan.domain.model.ProductionPlanMaster;
import egovframework.let.production.plan.domain.model.ProductionPlanVO;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 생산계획 데이터 처리를 위한 DAO 인터페이스
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
@Repository("ProductionPlanDAO")
public interface ProductionPlanDAO {

	/**
	 * 생산계획 마스터를 등록한다.
	 * @param master 생산계획 마스터 정보
	 * @return 등록 결과
	 * @throws Exception
	 */
	int insertProductionPlanMaster(ProductionPlanMaster master) throws Exception;

	/**
	 * 생산계획 상세를 등록한다.
	 * @param plan 생산계획 상세 정보
	 * @return 등록 결과
	 * @throws Exception
	 */
	int insertProductionPlan(ProductionPlan plan) throws Exception;

	/**
	 * 생산계획 마스터 목록을 조회한다.
	 * @param searchVO 검색 조건
	 * @return 생산계획 마스터 목록
	 * @throws Exception
	 */
	List<ProductionPlanMaster> selectProductionPlanMasterList(ProductionPlanVO searchVO) throws Exception;

	/**
	 * 생산계획 상세 목록을 조회한다.
	 * @param searchVO 검색 조건
	 * @return 생산계획 상세 목록
	 * @throws Exception
	 */
	List<ProductionPlan> selectProductionPlanList(ProductionPlanVO searchVO) throws Exception;

	/**
	 * 생산계획 상세를 조회한다.
	 * @param plan 조회 조건
	 * @return 생산계획 상세 정보
	 * @throws Exception
	 */
	ProductionPlan selectProductionPlan(ProductionPlan plan) throws Exception;

	/**
	 * 생산계획 마스터 총 건수를 조회한다.
	 * @param searchVO 검색 조건
	 * @return 총 건수
	 * @throws Exception
	 */
	int selectProductionPlanMasterListTotCnt(ProductionPlanVO searchVO) throws Exception;

	/**
	 * 생산계획번호로 계획상세 목록을 조회한다.
	 * @param planNo 계획번호
	 * @return 생산계획 상세 목록
	 * @throws Exception
	 */
	List<ProductionPlan> selectProductionPlanByPlanNo(String planNo) throws Exception;

	/**
	 * 생산계획 마스터를 수정한다.
	 * @param master 생산계획 마스터 정보
	 * @return 수정 결과
	 * @throws Exception
	 */
	int updateProductionPlanMaster(ProductionPlanMaster master) throws Exception;

	/**
	 * 생산계획 상세를 수정한다.
	 * @param plan 생산계획 상세 정보
	 * @return 수정 결과
	 * @throws Exception
	 */
	int updateProductionPlan(ProductionPlan plan) throws Exception;

	/**
	 * 생산계획 마스터를 삭제한다.
	 * @param master 생산계획 마스터 정보
	 * @return 삭제 결과
	 * @throws Exception
	 */
	int deleteProductionPlanMaster(ProductionPlanMaster master) throws Exception;

	/**
	 * 생산계획 상세를 삭제한다.
	 * @param plan 생산계획 상세 정보
	 * @return 삭제 결과
	 * @throws Exception
	 */
	int deleteProductionPlan(ProductionPlan plan) throws Exception;
}
