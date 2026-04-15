package egovframework.let.production.kpi.service.impl;

import egovframework.let.common.dto.ListResult;
import egovframework.let.production.kpi.domain.model.WorkplaceKpiReqDTO;
import egovframework.let.production.kpi.domain.model.WorkplaceKpiRow;
import egovframework.let.production.kpi.domain.model.WorkplaceKpiSummaryRow;
import egovframework.let.production.kpi.domain.model.WorkplaceKpiVO;
import egovframework.let.production.kpi.domain.repository.WorkplaceKpiDAO;
import egovframework.let.production.kpi.service.EgovWorkplaceKpiService;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service("egovWorkplaceKpiService")
@RequiredArgsConstructor
public class EgovWorkplaceKpiServiceImpl extends EgovAbstractServiceImpl implements EgovWorkplaceKpiService {

    private final WorkplaceKpiDAO workplaceKpiDAO;

    /**
     * 엑셀 업로드 데이터 저장.
     * 업로드된 행의 작업일 범위(min~max) 내 기존 데이터를 삭제 후 재삽입.
     */
    @Override
    @Transactional
    public void uploadKpiData(List<WorkplaceKpiReqDTO> dataList, String factoryCode, String regId) throws Exception {
        if (dataList == null || dataList.isEmpty()) {
            return;
        }

        // 업로드 데이터의 날짜 범위 산출
        String dateFrom = dataList.stream()
                .map(WorkplaceKpiReqDTO::getWorkDate)
                .filter(d -> d != null && !d.isEmpty())
                .min(Comparator.naturalOrder())
                .orElse("");
        String dateTo = dataList.stream()
                .map(WorkplaceKpiReqDTO::getWorkDate)
                .filter(d -> d != null && !d.isEmpty())
                .max(Comparator.naturalOrder())
                .orElse("");

        // 작업장별로 기존 데이터 삭제 후 재삽입
        String workcenterCode = dataList.get(0).getWorkcenterCode();

        WorkplaceKpiVO rangeVO = new WorkplaceKpiVO();
        rangeVO.setFactoryCode(factoryCode);
        rangeVO.setWorkcenterCode(workcenterCode);
        rangeVO.setDateFrom(dateFrom);
        rangeVO.setDateTo(dateTo);
        workplaceKpiDAO.deleteKpiByRange(rangeVO);

        for (WorkplaceKpiReqDTO dto : dataList) {
            dto.setFactoryCode(factoryCode);
            dto.setRegId(regId);
            workplaceKpiDAO.insertKpi(dto);
        }
    }

    @Override
    public ListResult<WorkplaceKpiRow> getKpiList(WorkplaceKpiVO vo) throws Exception {
        List<WorkplaceKpiRow> list = workplaceKpiDAO.selectKpiList(vo);
        int cnt = workplaceKpiDAO.selectKpiListCnt(vo);
        return new ListResult<>(list, cnt);
    }

    @Override
    public List<WorkplaceKpiSummaryRow> getKpiSummary(WorkplaceKpiVO vo) throws Exception {
        return workplaceKpiDAO.selectKpiSummary(vo);
    }
}
