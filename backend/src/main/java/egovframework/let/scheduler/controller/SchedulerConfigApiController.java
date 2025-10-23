package egovframework.let.scheduler.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.com.jwt.EgovJwtTokenUtil;
import egovframework.let.scheduler.model.SchedulerConfig;
import egovframework.let.scheduler.model.SchedulerConfigVO;
import egovframework.let.scheduler.service.SchedulerConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.property.EgovPropertyService;
import org.egovframe.rte.ptl.mvc.tags.ui.pagination.PaginationInfo;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 스케쥴러 설정 관리 컨트롤러
 * @author AI Assistant
 * @since 2025.10.23
 * @version 1.0
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "SchedulerConfigApiController", description = "스케쥴러 설정 관리")
@RequestMapping("/api/schedulers")
public class SchedulerConfigApiController {

    public static final String HEADER_STRING = "Authorization";
    private final EgovJwtTokenUtil jwtTokenUtil;
    private final ResultVoHelper resultVoHelper;
    private final SchedulerConfigService schedulerConfigService;
    private final EgovPropertyService propertyService;

    /**
     * 스케쥴러 목록을 조회한다.
     */
    @Operation(
            summary = "스케쥴러 목록 조회",
            description = "스케쥴러 목록을 조회",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"SchedulerConfigApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping
    public ResultVO selectSchedulerList(@ModelAttribute SchedulerConfigVO searchVO,
                                        @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user)
            throws Exception {

        PaginationInfo paginationInfo = new PaginationInfo();
        paginationInfo.setCurrentPageNo(searchVO.getPageIndex());
        paginationInfo.setRecordCountPerPage(
                searchVO.getPageUnit() > 0 ? searchVO.getPageUnit() : propertyService.getInt("Globals.pageUnit")
        );
        paginationInfo.setPageSize(propertyService.getInt("Globals.pageSize"));

        searchVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
        searchVO.setLastIndex(paginationInfo.getLastRecordIndex());
        searchVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());

        Map<String, Object> resultMap = schedulerConfigService.selectSchedulerList(searchVO);
        int totCnt = Integer.parseInt((String) resultMap.get("resultCnt"));
        paginationInfo.setTotalRecordCount(totCnt);
        resultMap.put("paginationInfo", paginationInfo);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 스케쥴러 상세 정보를 조회한다.
     */
    @Operation(
            summary = "스케쥴러 상세 조회",
            description = "스케쥴러 상세 정보를 조회",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"SchedulerConfigApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님"),
            @ApiResponse(responseCode = "404", description = "데이터를 찾을 수 없음")
    })
    @GetMapping("/{schedulerId}")
    public ResultVO selectSchedulerDetail(@Parameter(description = "스케쥴러 ID") @PathVariable Long schedulerId,
                                          @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user)
            throws Exception {

        SchedulerConfig scheduler = schedulerConfigService.selectSchedulerDetail(schedulerId);
        if (scheduler == null) {
            return resultVoHelper.buildFromMap(new HashMap<>(), ResponseCode.INPUT_CHECK_ERROR);
        }

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("scheduler", scheduler);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 스케쥴러를 등록한다.
     */
    @Operation(
            summary = "스케쥴러 등록",
            description = "새로운 스케쥴러를 등록",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"SchedulerConfigApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping
    public ResultVO insertScheduler(@RequestBody SchedulerConfig scheduler,
                                     @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user)
            throws Exception {

        scheduler.setCreatedBy(user.getId());
        schedulerConfigService.insertScheduler(scheduler);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "스케쥴러가 등록되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 스케쥴러를 수정한다.
     */
    @Operation(
            summary = "스케쥴러 수정",
            description = "스케쥴러 정보를 수정",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"SchedulerConfigApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PutMapping("/{schedulerId}")
    public ResultVO updateScheduler(@Parameter(description = "스케쥴러 ID") @PathVariable Long schedulerId,
                                     @RequestBody SchedulerConfig scheduler,
                                     @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user)
            throws Exception {

        scheduler.setSchedulerId(schedulerId);
        scheduler.setUpdatedBy(user.getId());
        schedulerConfigService.updateScheduler(scheduler);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "스케쥴러가 수정되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 스케쥴러를 삭제한다.
     */
    @Operation(
            summary = "스케쥴러 삭제",
            description = "스케쥴러를 삭제",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"SchedulerConfigApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @DeleteMapping("/{schedulerId}")
    public ResultVO deleteScheduler(@Parameter(description = "스케쥴러 ID") @PathVariable Long schedulerId,
                                     @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user)
            throws Exception {

        schedulerConfigService.deleteScheduler(schedulerId);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "스케쥴러가 삭제되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 스케쥴러를 재시작한다.
     */
    @Operation(
            summary = "스케쥴러 재시작",
            description = "모든 스케쥴러를 재시작",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"SchedulerConfigApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "재시작 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/restart")
    public ResultVO restartSchedulers(@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user)
            throws Exception {

        schedulerConfigService.restartSchedulers();

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "스케쥴러가 재시작되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }
}
