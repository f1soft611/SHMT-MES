package egovframework.let.production.performance.domain.repository;

import egovframework.let.production.performance.domain.model.ProductionPerformanceRow;
import egovframework.let.production.performance.domain.model.ProductionPerformanceSearchDto;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository("ProductionPerformanceDAO")
public class ProductionPerformanceDAO extends EgovAbstractMapper {


	public List<ProductionPerformanceRow> selectProdPerfList(ProductionPerformanceSearchDto searchDto) throws Exception {
		return selectList("ProductionPerformanceDAO.selectProdPerfList", searchDto);
	}

	public int selectProdPerfListCnt(ProductionPerformanceSearchDto searchDto) throws Exception {
		return (Integer) selectOne("ProductionPerformanceDAO.selectProdPerfListCnt", searchDto);
	}

}