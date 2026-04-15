package egovframework.let.production.kpi.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.let.common.dto.ListResult;
import egovframework.let.production.kpi.domain.model.WorkplaceKpiReqDTO;
import egovframework.let.production.kpi.domain.model.WorkplaceKpiRow;
import egovframework.let.production.kpi.domain.model.WorkplaceKpiSummaryRow;
import egovframework.let.production.kpi.domain.model.WorkplaceKpiVO;
import egovframework.let.production.kpi.service.EgovWorkplaceKpiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/prod/workplace-kpi")
@Tag(name = "EgovWorkplaceKpiApiController", description = "작업장별 KPI 집계")
public class EgovWorkplaceKpiApiController {

    private final ResultVoHelper resultVoHelper;
    private final EgovWorkplaceKpiService egovWorkplaceKpiService;

    /**
     * 엑셀 업로드 데이터 저장
     */
    @Operation(
            summary = "KPI] 엑셀 업로드 데이터 저장",
            description = "프론트에서 파싱한 엑셀 데이터를 JSON 배열로 수신하여 TPR701에 저장",
            security = {@SecurityRequirement(name = "Authorization")}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "저장 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @PostMapping("/upload")
    public ResultVO uploadKpiData(
            @RequestBody List<WorkplaceKpiReqDTO> dataList,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        egovWorkplaceKpiService.uploadKpiData(dataList, user.getFactoryCode(), user.getId());

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("savedCount", dataList.size());
        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 로우 데이터 목록 조회
     */
    @Operation(
            summary = "KPI] 로우 데이터 목록 조회",
            description = "작업장 + 년월 기준 TPR701 로우 데이터 페이징 조회",
            security = {@SecurityRequirement(name = "Authorization")}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/list")
    public ResultVO getKpiList(
            @ModelAttribute WorkplaceKpiVO searchVO,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        searchVO.setFactoryCode(user.getFactoryCode());
        buildDateRange(searchVO);
        searchVO.setOffset(page * size);
        searchVO.setSize(size);

        ListResult<WorkplaceKpiRow> data = egovWorkplaceKpiService.getKpiList(searchVO);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", data.getResultList());
        resultMap.put("resultCnt", data.getResultCnt());
        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 일별 집계 조회 (차트용)
     */
    @Operation(
            summary = "KPI] 일별 집계 조회",
            description = "작업장 + 년월 기준 일별 집계 데이터 조회 (차트용)",
            security = {@SecurityRequirement(name = "Authorization")}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/summary")
    public ResultVO getKpiSummary(
            @ModelAttribute WorkplaceKpiVO searchVO,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        searchVO.setFactoryCode(user.getFactoryCode());
        buildDateRange(searchVO);

        List<WorkplaceKpiSummaryRow> summaryList = egovWorkplaceKpiService.getKpiSummary(searchVO);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", summaryList);
        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * yearMonth(yyyyMM) → dateFrom(yyyyMM01) / dateTo(yyyyMMdd 말일) 변환
     */
    private void buildDateRange(WorkplaceKpiVO vo) {
        String ym = vo.getYearMonth();
        if (ym == null || ym.length() != 6) {
            // 기본값: 당월
            java.time.YearMonth now = java.time.YearMonth.now();
            ym = String.format("%04d%02d", now.getYear(), now.getMonthValue());
            vo.setYearMonth(ym);
        }
        vo.setDateFrom(ym + "01");
        java.time.YearMonth yearMonth = java.time.YearMonth.of(
                Integer.parseInt(ym.substring(0, 4)),
                Integer.parseInt(ym.substring(4, 6))
        );
        vo.setDateTo(ym + String.format("%02d", yearMonth.lengthOfMonth()));
    }
}
