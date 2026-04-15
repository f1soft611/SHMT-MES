package egovframework.let.production.kpi.service;

import egovframework.let.common.dto.ListResult;
import egovframework.let.production.kpi.domain.model.WorkplaceKpiReqDTO;
import egovframework.let.production.kpi.domain.model.WorkplaceKpiRow;
import egovframework.let.production.kpi.domain.model.WorkplaceKpiSummaryRow;
import egovframework.let.production.kpi.domain.model.WorkplaceKpiVO;

import java.util.List;

public interface EgovWorkplaceKpiService {

    /** 엑셀 업로드 데이터 저장 (같은 작업장+기간 덮어쓰기) */
    void uploadKpiData(List<WorkplaceKpiReqDTO> dataList, String factoryCode, String regId) throws Exception;

    /** 로우 데이터 목록 조회 */
    ListResult<WorkplaceKpiRow> getKpiList(WorkplaceKpiVO vo) throws Exception;

    /** 일별 집계 조회 (차트용) */
    List<WorkplaceKpiSummaryRow> getKpiSummary(WorkplaceKpiVO vo) throws Exception;
}
