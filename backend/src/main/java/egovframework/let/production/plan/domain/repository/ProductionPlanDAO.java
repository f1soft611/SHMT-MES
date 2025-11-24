package egovframework.let.production.plan.domain.repository;

import egovframework.let.production.plan.domain.model.ProductionPlan;
import egovframework.let.production.plan.domain.model.ProductionPlanMaster;
import egovframework.let.production.plan.domain.model.ProductionPlanVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 생산계획 데이터 처리를 위한 DAO 클래스
 * EgovAbstractMapper를 상속받아 MyBatis SQL 처리를 수행한다.
 * * @author SHMT-MES
 * @since 2025.11.21
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 * 수정일      수정자           수정내용
 * -------    --------    ---------------------------
 * 2025.11.21 SHMT-MES          최초 생성 및 클래스 구현 방식으로 변경
 *
 * </pre>
 */
@Repository("ProductionPlanDAO")
public class ProductionPlanDAO extends EgovAbstractMapper {

	/**
	 * 생산계획 마스터를 등록한다.
	 * XML 매퍼의 'ProductionPlanDAO.insertProductionPlanMaster' ID를 호출한다.
	 * @param master 생산계획 마스터 정보
	 * @return 등록(INSERT) 결과, 성공 시 1
	 * @throws Exception SQL 실행 중 오류 발생 시
	 */
	public int insertProductionPlanMaster(ProductionPlanMaster master) throws Exception {
		return insert("ProductionPlanDAO.insertProductionPlanMaster", master);
	}

	/**
	 * 생산계획 상세를 등록한다.
	 * XML 매퍼의 'ProductionPlanDAO.insertProductionPlan' ID를 호출한다.
	 * @param plan 생산계획 상세 정보
	 * @return 등록(INSERT) 결과, 성공 시 1
	 * @throws Exception SQL 실행 중 오류 발생 시
	 */
	public int insertProductionPlan(ProductionPlan plan) throws Exception {
		return insert("ProductionPlanDAO.insertProductionPlan", plan);
	}

	/**
	 * 생산계획 참조(주문연결)를 등록한다.
	 * XML 매퍼의 'ProductionPlanDAO.insertProductionPlanReference' ID를 호출한다.
	 * @param reference 생산계획 참조 정보
	 * @return 등록(INSERT) 결과, 성공 시 1
	 * @throws Exception SQL 실행 중 오류 발생 시
	 */
	public int insertProductionPlanReference(egovframework.let.production.plan.domain.model.ProductionPlanReference reference) throws Exception {
		return insert("ProductionPlanDAO.insertProductionPlanReference", reference);
	}

	/**
	 * 생산계획 마스터 목록을 조회한다.
	 * XML 매퍼의 'ProductionPlanDAO.selectProductionPlanMasterList' ID를 호출한다.
	 * @param searchVO 검색 조건 (페이징 정보 포함)
	 * @return 생산계획 마스터 목록
	 * @throws Exception SQL 실행 중 오류 발생 시
	 */
	public List<ProductionPlanMaster> selectProductionPlanMasterList(ProductionPlanVO searchVO) throws Exception {
		return selectList("ProductionPlanDAO.selectProductionPlanMasterList", searchVO);
	}

	/**
	 * 생산계획 상세 목록을 조회한다.
	 * XML 매퍼의 'ProductionPlanDAO.selectProductionPlanList' ID를 호출한다.
	 * @param searchVO 검색 조건
	 * @return 생산계획 상세 목록
	 * @throws Exception SQL 실행 중 오류 발생 시
	 */
	public List<ProductionPlan> selectProductionPlanList(ProductionPlanVO searchVO) throws Exception {
		return selectList("ProductionPlanDAO.selectProductionPlanList", searchVO);
	}

	/**
	 * 생산계획 상세 한 건을 조회한다.
	 * XML 매퍼의 'ProductionPlanDAO.selectProductionPlan' ID를 호출한다.
	 * @param plan 조회 조건 (계획 상세 정보)
	 * @return 생산계획 상세 정보
	 * @throws Exception SQL 실행 중 오류 발생 시
	 */
	public ProductionPlan selectProductionPlan(ProductionPlan plan) throws Exception {
		return selectOne("ProductionPlanDAO.selectProductionPlan", plan);
	}

	/**
	 * 생산계획 마스터 목록의 총 건수를 조회한다.
	 * XML 매퍼의 'ProductionPlanDAO.selectProductionPlanMasterListTotCnt' ID를 호출한다.
	 * @param searchVO 검색 조건
	 * @return 총 건수
	 * @throws Exception SQL 실행 중 오류 발생 시
	 */
	public int selectProductionPlanMasterListTotCnt(ProductionPlanVO searchVO) throws Exception {
		// selectOne의 반환 타입이 Object이므로 Integer로 캐스팅
		return (Integer) selectOne("ProductionPlanDAO.selectProductionPlanMasterListTotCnt", searchVO);
	}

	/**
	 * 생산계획번호를 기준으로 계획 상세 목록을 조회한다.
	 * XML 매퍼의 'ProductionPlanDAO.selectProductionPlanByPlanNo' ID를 호출한다.
	 * @param planNo 계획번호
	 * @return 생산계획 상세 목록
	 * @throws Exception SQL 실행 중 오류 발생 시
	 */
	public List<ProductionPlan> selectProductionPlanByPlanNo(String planNo) throws Exception {
		return selectList("ProductionPlanDAO.selectProductionPlanByPlanNo", planNo);
	}

	/**
	 * 생산계획 마스터를 수정한다.
	 * XML 매퍼의 'ProductionPlanDAO.updateProductionPlanMaster' ID를 호출한다.
	 * @param master 생산계획 마스터 정보
	 * @return 수정(UPDATE) 결과, 성공 시 1
	 * @throws Exception SQL 실행 중 오류 발생 시
	 */
	public int updateProductionPlanMaster(ProductionPlanMaster master) throws Exception {
		return update("ProductionPlanDAO.updateProductionPlanMaster", master);
	}

	/**
	 * 생산계획 상세를 수정한다.
	 * XML 매퍼의 'ProductionPlanDAO.updateProductionPlan' ID를 호출한다.
	 * @param plan 생산계획 상세 정보
	 * @return 수정(UPDATE) 결과, 성공 시 1
	 * @throws Exception SQL 실행 중 오류 발생 시
	 */
	public int updateProductionPlan(ProductionPlan plan) throws Exception {
		return update("ProductionPlanDAO.updateProductionPlan", plan);
	}

	/**
	 * 생산계획 마스터를 삭제한다.
	 * XML 매퍼의 'ProductionPlanDAO.deleteProductionPlanMaster' ID를 호출한다.
	 * @param master 생산계획 마스터 정보
	 * @return 삭제(DELETE) 결과, 성공 시 1
	 * @throws Exception SQL 실행 중 오류 발생 시
	 */
	public int deleteProductionPlanMaster(ProductionPlanMaster master) throws Exception {
		return delete("ProductionPlanDAO.deleteProductionPlanMaster", master);
	}
}