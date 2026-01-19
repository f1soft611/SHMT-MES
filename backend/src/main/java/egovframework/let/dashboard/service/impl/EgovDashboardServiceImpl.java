package egovframework.let.dashboard.service.impl;

import egovframework.com.cmm.LoginVO;
import egovframework.let.dashboard.domain.model.DashboardAlertDTO;
import egovframework.let.dashboard.domain.model.DashboardKPIDTO;
import egovframework.let.dashboard.domain.model.ProcessProgressDTO;
import egovframework.let.dashboard.domain.model.ProductionProgressDTO;
import egovframework.let.dashboard.domain.model.WorkplaceProgressDTO;
import egovframework.let.dashboard.domain.repository.DashboardDAO;
import egovframework.let.dashboard.service.EgovDashboardService;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 대시보드 서비스 구현
 * @author SHMT-MES
 * @since 2026.01.15
 * @version 1.0
 */
@Service("egovDashboardService")
@RequiredArgsConstructor
public class EgovDashboardServiceImpl extends EgovAbstractServiceImpl implements EgovDashboardService {

    private final DashboardDAO dashboardDAO;

    /**
     * 생산계획별 진행 현황 조회
     */
    @Override
    public Map<String, Object> getProductionProgress(String planNo, Integer planSeq, LoginVO user) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("factoryCode", user.getFactoryCode());
        params.put("planNo", planNo);
        if (planSeq != null) {
            params.put("planSeq", planSeq);
        }

        ProductionProgressDTO progress = dashboardDAO.selectProductionProgress(params);

        if (progress != null) {
            // 계산 로직 실행
            progress.calculateAll();
            progress.setPlanStatusName();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("progress", progress);
        result.put("user", user);

        return result;
    }

    /**
     * 진행 중인 생산계획 목록 조회
     */
    @Override
    public Map<String, Object> getActiveProductionList(String workplaceCode, LoginVO user) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("factoryCode", user.getFactoryCode());
        if (workplaceCode != null && !workplaceCode.isEmpty()) {
            params.put("workplaceCode", workplaceCode);
        }

        List<ProductionProgressDTO> progressList = dashboardDAO.selectActiveProductionList(params);

        // 각 항목에 대해 계산 실행
        for (ProductionProgressDTO progress : progressList) {
            progress.calculateAll();
            progress.setPlanStatusName();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("resultList", progressList);
        result.put("resultCnt", progressList.size());
        result.put("user", user);

        return result;
    }

    /**
     * 오늘의 생산계획 진행 현황 목록
     */
    @Override
    public Map<String, Object> getTodayProductionProgressList(String planDate, String workplaceCode, LoginVO user) throws Exception {
        // 날짜가 없으면 오늘 날짜 사용
        if (planDate == null || planDate.isEmpty()) {
            planDate = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        }

        Map<String, Object> params = new HashMap<>();
        params.put("factoryCode", user.getFactoryCode());
        params.put("planDate", planDate);
        if (workplaceCode != null && !workplaceCode.isEmpty()) {
            params.put("workplaceCode", workplaceCode);
        }

        List<ProductionProgressDTO> progressList = dashboardDAO.selectTodayProductionProgressList(params);

        // 각 항목에 대해 계산 실행
        for (ProductionProgressDTO progress : progressList) {
            progress.calculateAll();
            progress.setPlanStatusName();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("resultList", progressList);
        result.put("resultCnt", progressList.size());
        result.put("planDate", planDate);
        result.put("user", user);

        return result;
    }

    /**
     * 작업장별 생산 진행 현황
     */
    @Override
    public Map<String, Object> getProductionProgressByWorkplace(String planDate, LoginVO user) throws Exception {
        // 날짜가 없으면 오늘 날짜 사용
        if (planDate == null || planDate.isEmpty()) {
            planDate = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        }

        Map<String, Object> params = new HashMap<>();
        params.put("factoryCode", user.getFactoryCode());
        params.put("planDate", planDate);

        List<WorkplaceProgressDTO> progressList = dashboardDAO.selectProductionProgressByWorkplace(params);

        Map<String, Object> result = new HashMap<>();
        result.put("resultList", progressList);
        result.put("resultCnt", progressList.size());
        result.put("planDate", planDate);
        result.put("user", user);

        return result;
    }

    /**
     * 공정별 진행 현황 조회
     */
    @Override
    public Map<String, Object> getProcessProgressList(String planDate, Integer planSeq, LoginVO user) throws Exception {
        // 날짜가 없으면 오늘 날짜 사용
        if (planDate == null || planDate.isEmpty()) {
            planDate = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        }

        Map<String, Object> params = new HashMap<>();
        params.put("factoryCode", user.getFactoryCode());
        params.put("planDate", planDate);
        params.put("planSeq", planSeq);

        List<ProcessProgressDTO> processList = dashboardDAO.selectProcessProgressList(params);

        // 각 공정에 대한 상태명 설정
        for (ProcessProgressDTO process : processList) {
            setProcessStatusName(process);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("resultList", processList);
        result.put("resultCnt", processList.size());
        result.put("planDate", planDate);
        result.put("planSeq", planSeq);
        result.put("user", user);

        return result;
    }

    /**
     * 공정 상태명 설정
     */
    private void setProcessStatusName(ProcessProgressDTO process) {
        String status = process.getProcessStatus();
        if (status != null) {
            switch (status) {
                case "COMPLETED":
                    process.setProcessStatus("완료");
                    break;
                case "IN_PROGRESS":
                    process.setProcessStatus("진행중");
                    break;
                case "PLANNED":
                    process.setProcessStatus("계획");
                    break;
                default:
                    process.setProcessStatus(status);
            }
        }
    }

    /**
     * 금일 대시보드 KPI 통계 조회
     */
    @Override
    public Map<String, Object> getTodayKPI(String planDate, LoginVO user) throws Exception {
        // 날짜가 없으면 오늘 날짜 사용
        if (planDate == null || planDate.isEmpty()) {
            planDate = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        }

        Map<String, Object> params = new HashMap<>();
        params.put("factoryCode", user.getFactoryCode());
        params.put("planDate", planDate);

        DashboardKPIDTO kpi = dashboardDAO.selectTodayKPI(params);

        // KPI가 없으면 기본값 생성
        if (kpi == null) {
            kpi = new DashboardKPIDTO();
            kpi.setPlanDate(planDate);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("kpi", kpi);
        result.put("planDate", planDate);
        result.put("user", user);

        return result;
    }

    /**
     * 실시간 알림/이슈 목록 조회
     */
    @Override
    public Map<String, Object> getRecentAlerts(String planDate, LoginVO user) throws Exception {
        // 날짜가 없으면 오늘 날짜 사용
        if (planDate == null || planDate.isEmpty()) {
            planDate = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        }

        Map<String, Object> params = new HashMap<>();
        params.put("planDate", planDate);

        List<DashboardAlertDTO> alerts = dashboardDAO.selectRecentAlerts(params);

        Map<String, Object> result = new HashMap<>();
        result.put("resultList", alerts);
        result.put("resultCnt", alerts.size());
        result.put("planDate", planDate);

        return result;
    }
}
