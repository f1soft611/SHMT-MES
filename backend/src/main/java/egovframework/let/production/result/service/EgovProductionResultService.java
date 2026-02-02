package egovframework.let.production.result.service;

import egovframework.let.common.dto.ListResult;
import egovframework.let.production.result.domain.model.*;

import java.util.List;

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
public interface EgovProductionResultService {

    /**
     * 생산지시 목록을 조회한다.
     * @param dto 검색 조건
     * @return 작업지시 목록과 총 건수
     * @throws Exception
     */
    ListResult<ProdResultOrderRow> selectProductionOrderList(ProdResultSearchDto dto) throws Exception;

    // 생산실적 TPR601 등록
    void insertProductionResult(List<ProdResultInsertDto> resultList) throws Exception;

    // 생산실적 수정
    void updateProductionResult(List<ProdResultUpdateDto> resultList) throws Exception;

    // 생산실적 삭제
    void deleteProductionResult(ProdResultDeleteDto dto) throws Exception;


    /**
     * 생산실적 detail 목록을 조회한다.
     * @param dto 검색 조건
     * @return 생산지시 detail 목록
     * @throws Exception
     */
    ListResult<ProdResultRow> selectProductionResultDetailList(ProdResultDto dto) throws Exception;


}
