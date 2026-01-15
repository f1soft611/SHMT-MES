package egovframework.let.dashboard.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.let.dashboard.service.EgovDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 대시보드 API 컨트롤러
 * @author SHMT-MES
 * @since 2026.01.15
 * @version 1.0
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dashboard")
@Tag(name = "EgovDashboardApiController", description = "대시보드 관리")
public class EgovDashboardApiController {

    private final ResultVoHelper resultVoHelper;
    private final EgovDashboardService dashboardService;

    /**
     * 생산계획별 진행 현황 조회
     */
    @Operation(
            summary = "생산계획별 진행 현황 조회",
            description = "특정 생산계획의 계획 대비 실적 진행 현황을 조회합니다.",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovDashboardApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/production-progress/{planNo}")
    public ResultVO getProductionProgress(
            @PathVariable("planNo") String planNo,
            @RequestParam(value = "planSeq", required = false) Integer planSeq,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {
        Map<String, Object> resultMap = dashboardService.getProductionProgress(planNo, planSeq, user);
        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 진행 중인 생산계획 목록 조회
     */
    @Operation(
            summary = "진행 중인 생산계획 목록 조회",
            description = "현재 진행 중인 생산계획 목록과 진행 현황을 조회합니다.",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovDashboardApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/active-productions")
    public ResultVO getActiveProductionList(
            @RequestParam(value = "workplaceCode", required = false) String workplaceCode,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {
        Map<String, Object> resultMap = dashboardService.getActiveProductionList(workplaceCode, user);
        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 오늘의 생산계획 진행 현황 목록
     */
    @Operation(
            summary = "오늘의 생산계획 진행 현황 목록",
            description = "오늘 날짜의 생산계획 진행 현황 목록을 조회합니다.",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovDashboardApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/today-progress")
    public ResultVO getTodayProductionProgressList(
            @RequestParam(value = "planDate", required = false) String planDate,
            @RequestParam(value = "workplaceCode", required = false) String workplaceCode,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {
        Map<String, Object> resultMap = dashboardService.getTodayProductionProgressList(planDate, workplaceCode, user);
        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 작업장별 생산 진행 현황
     */
    @Operation(
            summary = "작업장별 생산 진행 현황",
            description = "작업장별로 생산 진행 현황을 집계하여 조회합니다.",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovDashboardApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/workplace-progress")
    public ResultVO getProductionProgressByWorkplace(
            @RequestParam(value = "planDate", required = false) String planDate,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {
        Map<String, Object> resultMap = dashboardService.getProductionProgressByWorkplace(planDate, user);
        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 진행 현황 조회
     */
    @Operation(
            summary = "공정별 진행 현황 조회",
            description = "생산계획의 공정별 진행 현황을 조회합니다.",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovDashboardApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/process-progress")
    public ResultVO getProcessProgressList(
            @RequestParam(value = "planDate") String planDate,
            @RequestParam(value = "planSeq") Integer planSeq,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {
        Map<String, Object> resultMap = dashboardService.getProcessProgressList(planDate, planSeq, user);
        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 금일 대시보드 KPI 통계 조회
     */
    @Operation(
            summary = "금일 대시보드 KPI 통계 조회",
            description = "금일 생산계획의 전체 통계를 조회합니다.",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovDashboardApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/today-kpi")
    public ResultVO getTodayKPI(
            @RequestParam(value = "planDate", required = false) String planDate,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {
        Map<String, Object> resultMap = dashboardService.getTodayKPI(planDate, user);
        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 실시간 알림/이슈 목록 조회
     */
    @Operation(
            summary = "실시간 알림/이슈 목록 조회",
            description = "금일 발생한 생산 이슈 및 알림 목록을 우선순위별로 조회합니다.",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovDashboardApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/recent-alerts")
    public ResultVO getRecentAlerts(
            @RequestParam(value = "planDate", required = false) String planDate,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {
        Map<String, Object> resultMap = dashboardService.getRecentAlerts(planDate, user);
        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }
}
