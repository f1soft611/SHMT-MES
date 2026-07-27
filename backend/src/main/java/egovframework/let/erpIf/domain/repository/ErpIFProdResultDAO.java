package egovframework.let.erpIf.domain.repository;

import egovframework.let.production.result.domain.model.ErpIFProdResultDto;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;

@Repository("ErpIFProdResultDAO")
public class ErpIFProdResultDAO extends EgovAbstractMapper {

    @Resource(name = "erpSqlSessionTemplate")
    public void setErpSqlSessionTemplate(SqlSessionTemplate sqlSessionTemplate) {
        super.setSqlSessionTemplate(sqlSessionTemplate);
    }

    // ERP 생산실적 인터페이스 INSERT
    public void insertErpIFProdResult(ErpIFProdResultDto dto) {
        insert("ErpIFProdResultDAO.insertErpIFProdResult", dto);
    }
}