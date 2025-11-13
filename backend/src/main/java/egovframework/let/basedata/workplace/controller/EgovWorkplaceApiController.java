package egovframework.let.basedata.workplace.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.let.basedata.process.service.EgovProcessService;
import egovframework.let.basedata.workplace.domain.model.*;
import egovframework.let.basedata.workplace.service.EgovWorkplaceService;
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
import java.util.List;
import java.util.Map;

/**
 * 작업장 관리를 위한 컨트롤러 클래스
 * @author SHMT-MES
 * @since 2025.10.21
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.10.21 SHMT-MES          최초 생성
 *
 * </pre>
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Tag(name="EgovWorkplaceApiController", description = "작업장 관리")
public class EgovWorkplaceApiController {

    private final ResultVoHelper resultVoHelper;
    private final EgovWorkplaceService workplaceService;
    private final EgovPropertyService propertyService;

    /**
     * 작업장 목록을 조회한다.
     */
    @Operation(
            summary = "작업장 목록 조회",
            description = "작업장 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovWorkplaceApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/workplaces")
    public ResultVO selectWorkplaceList(
            @ModelAttribute WorkplaceVO workplaceVO,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        PaginationInfo paginationInfo = new PaginationInfo();
        paginationInfo.setCurrentPageNo(workplaceVO.getPageIndex());
        paginationInfo.setRecordCountPerPage(
                workplaceVO.getPageUnit() > 0 ? workplaceVO.getPageUnit() : propertyService.getInt("Globals.pageUnit")
        );
        paginationInfo.setPageSize(propertyService.getInt("Globals.pageSize"));

        workplaceVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
        workplaceVO.setLastIndex(paginationInfo.getLastRecordIndex());
        workplaceVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());

        System.out.println(workplaceVO);
        Map<String, Object> resultMap = workplaceService.selectWorkplaceList(workplaceVO);
        int totCnt = Integer.parseInt((String)resultMap.get("resultCnt"));
        paginationInfo.setTotalRecordCount(totCnt);
        
        resultMap.put("workplaceVO", workplaceVO);
        resultMap.put("paginationInfo", paginationInfo);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 작업장 상세 정보를 조회한다.
     */
    @Operation(
            summary = "작업장 상세 조회",
            description = "작업장 상세 정보를 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovWorkplaceApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/workplaces/{workplaceId}")
    public ResultVO selectWorkplace(
            @PathVariable String workplaceId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        Workplace workplace = workplaceService.selectWorkplace(workplaceId);
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("workplace", workplace);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 작업장을 등록한다.
     */
    @Operation(
            summary = "작업장 등록",
            description = "작업장을 등록한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovWorkplaceApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/workplaces")
    public ResultVO insertWorkplace(
            @RequestBody Workplace workplace,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        // 작업장 코드 중복 체크
        if (workplaceService.isWorkplaceCodeExists(workplace.getWorkplaceCode())) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("message", "이미 존재하는 작업장 코드입니다.");
            errorMap.put("duplicateField", "workplaceCode");
            errorMap.put("duplicateValue", workplace.getWorkplaceCode());

            return resultVoHelper.buildFromMap(errorMap, ResponseCode.INPUT_CHECK_ERROR);
        }

        workplace.setRegUserId(user.getUniqId());
        workplaceService.insertWorkplace(workplace);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "작업장이 등록되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 작업장을 수정한다.
     */
    @Operation(
            summary = "작업장 수정",
            description = "작업장을 수정한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovWorkplaceApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PutMapping("/workplaces/{workplaceId}")
    public ResultVO updateWorkplace(
            @PathVariable String workplaceId,
            @RequestBody Workplace workplace,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        workplace.setWorkplaceId(workplaceId);
        workplace.setUpdUserId(user.getUniqId());
        workplaceService.updateWorkplace(workplace);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "작업장이 수정되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 작업장을 삭제한다.
     */
    @Operation(
            summary = "작업장 삭제",
            description = "작업장을 삭제한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovWorkplaceApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @DeleteMapping("/workplaces/{workplaceId}")
    public ResultVO deleteWorkplace(
            @PathVariable String workplaceId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        workplaceService.deleteWorkplace(workplaceId);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "작업장이 삭제되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 작업장별 작업자 목록을 조회한다.
     */
    @Operation(
            summary = "작업장별 작업자 목록 조회",
            description = "작업장별 작업자 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovWorkplaceApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/workplaces/{workplaceCode}/workers")
    public ResultVO selectWorkplaceWorkerList(
            @PathVariable String workplaceCode,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        WorkplaceWorkerVO workplaceWorkerVO = new WorkplaceWorkerVO();
        workplaceWorkerVO.setWorkplaceCode(workplaceCode);
        
        List<WorkplaceWorkerVO> resultList = workplaceService.selectWorkplaceWorkerList(workplaceWorkerVO);
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", resultList);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 작업장별 작업자를 등록한다.
     */
    @Operation(
            summary = "작업장별 작업자 등록",
            description = "작업장별 작업자를 등록한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovWorkplaceApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/workplaces/{workplaceId}/workers")
    public ResultVO insertWorkplaceWorker(
            @PathVariable String workplaceId,
            @RequestBody WorkplaceWorker workplaceWorker,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        workplaceWorker.setWorkplaceId(workplaceId);
        workplaceWorker.setRegUserId(user.getUniqId());
        workplaceService.insertWorkplaceWorker(workplaceWorker);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "작업자가 등록되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 작업장별 작업자를 삭제한다.
     */
    @Operation(
            summary = "작업장별 작업자 삭제",
            description = "작업장별 작업자를 삭제한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovWorkplaceApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @DeleteMapping("/workplaces/{workplaceCode}/workers/{workerCode}")
    public ResultVO deleteWorkplaceWorker(
            @PathVariable String workplaceCode,
            @PathVariable String workerCode,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        WorkplaceWorkerVO workplaceWorkerVO = new WorkplaceWorkerVO();
        workplaceWorkerVO.setWorkplaceCode(workplaceCode);
        workplaceWorkerVO.setWorkerCode(workerCode);
        workplaceService.deleteWorkplaceWorker(workplaceWorkerVO);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "작업자가 삭제되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 작업장별 공정 목록을 조회한다.
     */
    @Operation(
            summary = "작업장별 공정 목록 조회",
            description = "작업장별 공정 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovWorkplaceApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/workplaces/{workplaceCode}/processes")
    public ResultVO selectWorkplaceProcessList(
            @PathVariable String workplaceCode,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        WorkplaceProcessVO workplaceProcessVO = new WorkplaceProcessVO();
        workplaceProcessVO.setWorkplaceCode(workplaceCode);
        
        List<WorkplaceProcessVO> resultList = workplaceService.selectWorkplaceProcessList(workplaceProcessVO);
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", resultList);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 작업장별 공정을 등록한다.
     */
    @Operation(
            summary = "작업장별 공정 등록",
            description = "작업장별 공정을 등록한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovWorkplaceApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/workplaces/{workplaceId}/processes")
    public ResultVO insertWorkplaceProcess(
            @PathVariable String workplaceId,
            @RequestBody WorkplaceProcess workplaceProcess,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        workplaceProcess.setWorkplaceId(workplaceId);
        workplaceProcess.setRegUserId(user.getUniqId());
        workplaceService.insertWorkplaceProcess(workplaceProcess);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공정이 등록되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 작업장별 공정을 삭제한다.
     */
    @Operation(
            summary = "작업장별 공정 삭제",
            description = "작업장별 공정을 삭제한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovWorkplaceApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @DeleteMapping("/workplaces/{workplaceCode}/processes/{processCode}")
    public ResultVO deleteWorkplaceProcess(
            @PathVariable String workplaceCode,
            @PathVariable String processCode,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        WorkplaceProcessVO workplaceProcessVO = new WorkplaceProcessVO();
        workplaceProcessVO.setWorkplaceCode(workplaceCode);
        workplaceProcessVO.setProcessCode(processCode);
        workplaceService.deleteWorkplaceProcess(workplaceProcessVO);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공정이 삭제되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }
}
