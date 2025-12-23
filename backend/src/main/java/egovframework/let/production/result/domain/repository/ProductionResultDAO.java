package egovframework.let.production.result.domain.repository;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

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
@Repository("ProductionResultDAO")
public class ProductionResultDAO extends EgovAbstractMapper {

	// 조건에 맞는 생산지시 목록 반환
	public List<Map<String, Object>> selectProductionOrderList(Map<String, Object> searchVO) throws Exception {
		return selectList("ProductionResultDAO.selectProductionOrderList", searchVO);
	}

	// 조건에 맞는 생산지시 전체 건 수
	public int selectProductionOrderListCount(Map<String, Object> searchVO) throws Exception {
		return (Integer)selectOne("ProductionResultDAO.selectProductionOrderListCount", searchVO);
	}

}