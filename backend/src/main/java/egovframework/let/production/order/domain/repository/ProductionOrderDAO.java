package egovframework.let.production.order.domain.repository;

import egovframework.let.cop.bbs.domain.model.Board;
import egovframework.let.cop.bbs.domain.model.BoardVO;
import egovframework.let.production.order.domain.model.ProductionOrder;
import egovframework.let.production.order.domain.model.ProductionOrderVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.Iterator;
import java.util.List;

/**
 * 생산 지시 관리를 위한 데이터 접근 클래스
 * @author 김기형
 * @since 2025.07.22
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.07.22 김기형          최초 생성
 *
 * </pre>
 */
@Repository("ProductionOrderDAO")
public class ProductionOrderDAO extends EgovAbstractMapper {

    /**
     * 조건에 맞는 게시물 목록을 조회 한다.
     *
     * @param productionOrderVO
     * @return
     * @throws Exception
     */
    public List<ProductionOrderVO> selectProductionOrderList(ProductionOrderVO productionOrderVO) throws Exception {
		return selectList("ProductionOrderDAO.selectProductionOrderList", productionOrderVO);
	}
}
