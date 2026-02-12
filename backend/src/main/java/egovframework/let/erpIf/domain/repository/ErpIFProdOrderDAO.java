package egovframework.let.erpIf.domain.repository;

import egovframework.let.production.order.domain.model.ErpIFProdOrderDto;
import egovframework.let.production.order.domain.model.ErpIFProdOrderResultDto;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.util.List;

@Repository("ErpIFProdOrderDAO")
public class ErpIFProdOrderDAO extends EgovAbstractMapper {

    @Resource(name = "erpSqlSessionTemplate")
    public void setErpSqlSessionTemplate(SqlSessionTemplate sqlSessionTemplate) {
        super.setSqlSessionTemplate(sqlSessionTemplate);
    }

    // ERP 작업지시 인터페이스 INSERT
    public void insertErpIFProdOrder(ErpIFProdOrderDto dto) {
        insert("ErpIFProdOrderDAO.insertErpIFProdOrder", dto);
    }

    // ERP 작업지시 인터페이스 INSERT_BATCH
    public void insertErpIFProdOrderBatch(List<ErpIFProdOrderDto> list) {
        if (list == null || list.isEmpty()) return;
        insert("ErpIFProdOrderDAO.insertErpIFProdOrderBatch", list);
    }

    // ERP 처리결과 UPDATE
    public int updateErpIFProdOrderResult(ErpIFProdOrderResultDto dto) {
        return update("ErpIFProdOrderDAO.updateErpIFProdOrderResult", dto);
    }

    // 중복 전송 방지
    public int existsByMesIfKey(String mesIfKey) {
        return (Integer) selectOne("ErpIFProdOrderDAO.existsByMesIfKey", mesIfKey);
    }

}
