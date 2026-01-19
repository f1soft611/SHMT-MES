package egovframework.let.dashboard.domain.repository;

import egovframework.let.dashboard.domain.model.DashboardAlertDTO;
import egovframework.let.dashboard.domain.model.DashboardKPIDTO;
import egovframework.let.dashboard.domain.model.ProcessProgressDTO;
import egovframework.let.dashboard.domain.model.ProductionProgressDTO;
import egovframework.let.dashboard.domain.model.WorkplaceProgressDTO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * 대시보드 DAO
 * @author SHMT-MES
 * @since 2026.01.15
 * @version 1.0
 */
@Repository("DashboardDAO")
public class DashboardDAO extends EgovAbstractMapper {

    /**
     * 생산계획별 진행 현황 조회
     */
    public ProductionProgressDTO selectProductionProgress(Map<String, Object> params) {
        return selectOne("DashboardDAO.selectProductionProgress", params);
    }

    /**
     * 진행 중인 생산계획 목록 조회
     */
    public List<ProductionProgressDTO> selectActiveProductionList(Map<String, Object> params) {
        return selectList("DashboardDAO.selectActiveProductionList", params);
    }

    /**
     * 오늘의 생산계획 진행 현황 목록
     */
    public List<ProductionProgressDTO> selectTodayProductionProgressList(Map<String, Object> params) {
        return selectList("DashboardDAO.selectTodayProductionProgressList", params);
    }

    /**
     * 작업장별 생산 진행 현황
     */
    public List<WorkplaceProgressDTO> selectProductionProgressByWorkplace(Map<String, Object> params) {
        return selectList("DashboardDAO.selectProductionProgressByWorkplace", params);
    }

    /**
     * 공정별 진행 현황 조회
     */
    public List<ProcessProgressDTO> selectProcessProgressList(Map<String, Object> params) {
        return selectList("DashboardDAO.selectProcessProgressList", params);
    }

    /**
     * 금일 대시보드 KPI 통계 조회
     */
    public DashboardKPIDTO selectTodayKPI(Map<String, Object> params) {
        return selectOne("DashboardDAO.selectTodayKPI", params);
    }

    /**
     * 실시간 알림/이슈 목록 조회
     */
    public List<DashboardAlertDTO> selectRecentAlerts(Map<String, Object> params) {
        return selectList("DashboardDAO.selectRecentAlerts", params);
    }
}
