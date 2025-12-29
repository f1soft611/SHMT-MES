package egovframework.let.production.result.service;

import egovframework.com.cmm.LoginVO;
import egovframework.let.production.plan.domain.model.*;

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
public interface EgovProductionResultService {

    /**
     * 생산지시 목록을 조회한다.
     * @param searchVO 검색 조건
     * @param user 사용자 VO
     * @return 작업지시 목록과 총 건수
     * @throws Exception
     */
    Map<String, Object> selectProductionOrderList(Map<String, String> searchVO, LoginVO user) throws Exception;

    // 생산지시 TPR601 등록
    void insertProductionResult(List<Map<String, Object>> resultList) throws Exception;


    /**
     * 생산지시 detail 목록을 조회한다.
     * @param searchVO 검색 조건
     * @param user 사용자 VO
     * @return 생산지시 detail 목록
     * @throws Exception
     */
    Map<String, Object> selectProductionResultDetailList(Map<String, Object> searchVO, LoginVO user) throws Exception;


}
