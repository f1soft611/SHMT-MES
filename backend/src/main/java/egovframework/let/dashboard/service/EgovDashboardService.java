package egovframework.let.dashboard.service;

import egovframework.com.cmm.LoginVO;

import java.util.Map;

/**
 * 대시보드 서비스 인터페이스
 * @author SHMT-MES
 * @since 2026.01.15
 * @version 1.0
 */
public interface EgovDashboardService {

    /**
     * 생산계획별 진행 현황 조회
     */
    Map<String, Object> getProductionProgress(String planNo, Integer planSeq, LoginVO user) throws Exception;

    /**
     * 진행 중인 생산계획 목록 조회
     */
    Map<String, Object> getActiveProductionList(String workplaceCode, LoginVO user) throws Exception;

    /**
     * 오늘의 생산계획 진행 현황 목록
     */
    Map<String, Object> getTodayProductionProgressList(String planDate, String workplaceCode, LoginVO user) throws Exception;

    /**
     * 작업장별 생산 진행 현황
     */
    Map<String, Object> getProductionProgressByWorkplace(String planDate, LoginVO user) throws Exception;

    /**
     * 공정별 진행 현황 조회
     */
    Map<String, Object> getProcessProgressList(String planDate, Integer planSeq, LoginVO user) throws Exception;

    /**
     * 금일 대시보드 KPI 통계 조회
     */
    Map<String, Object> getTodayKPI(String planDate, LoginVO user) throws Exception;

    /**
     * 실시간 알림/이슈 목록 조회
     */
    Map<String, Object> getRecentAlerts(String planDate, LoginVO user) throws Exception;
}
