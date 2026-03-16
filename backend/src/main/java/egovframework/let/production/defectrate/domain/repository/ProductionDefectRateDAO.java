package egovframework.let.production.defectrate.domain.repository;


import egovframework.let.production.defectrate.domain.model.ProductionDefectRateRow;
import egovframework.let.production.defectrate.domain.model.ProductionDefectRateSearchDto;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository("ProductionDefectRateDAO")
public class ProductionDefectRateDAO extends EgovAbstractMapper {


	public List<ProductionDefectRateRow> selectProdDefectRateList(ProductionDefectRateSearchDto searchDto) throws Exception {
		return selectList("ProductionDefectRateDAO.selectProdDefectRateList", searchDto);
	}

	public int selectProdDefectRateListCnt(ProductionDefectRateSearchDto searchDto) throws Exception {
		return (Integer) selectOne("ProductionDefectRateDAO.selectProdDefectRateListCnt", searchDto);
	}

}