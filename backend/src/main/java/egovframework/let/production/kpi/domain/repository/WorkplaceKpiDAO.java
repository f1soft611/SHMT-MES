package egovframework.let.production.kpi.domain.repository;

import egovframework.let.production.kpi.domain.model.WorkplaceKpiReqDTO;
import egovframework.let.production.kpi.domain.model.WorkplaceKpiRow;
import egovframework.let.production.kpi.domain.model.WorkplaceKpiSummaryRow;
import egovframework.let.production.kpi.domain.model.WorkplaceKpiVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("WorkplaceKpiDAO")
public class WorkplaceKpiDAO extends EgovAbstractMapper {

    /** 기간 내 기존 데이터 삭제 (작업장 + dateFrom~dateTo) */
    public int deleteKpiByRange(WorkplaceKpiVO vo) throws Exception {
        return delete("WorkplaceKpiDAO.deleteKpiByRange", vo);
    }

    /** 단건 INSERT */
    public int insertKpi(WorkplaceKpiReqDTO dto) throws Exception {
        return insert("WorkplaceKpiDAO.insertKpi", dto);
    }

    /** 로우 데이터 목록 조회 */
    public List<WorkplaceKpiRow> selectKpiList(WorkplaceKpiVO vo) throws Exception {
        return selectList("WorkplaceKpiDAO.selectKpiList", vo);
    }

    /** 로우 데이터 총 건수 */
    public int selectKpiListCnt(WorkplaceKpiVO vo) throws Exception {
        return (Integer) selectOne("WorkplaceKpiDAO.selectKpiListCnt", vo);
    }

    /** 일별 집계 조회 (차트용) */
    public List<WorkplaceKpiSummaryRow> selectKpiSummary(WorkplaceKpiVO vo) throws Exception {
        return selectList("WorkplaceKpiDAO.selectKpiSummary", vo);
    }
}
