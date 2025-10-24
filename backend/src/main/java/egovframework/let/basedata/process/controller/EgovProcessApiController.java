package egovframework.let.basedata.process.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.let.basedata.process.domain.model.*;
import egovframework.let.basedata.process.domain.model.Process;
import egovframework.let.basedata.process.service.EgovProcessService;
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
 * 공정 관리를 위한 컨트롤러 클래스
 * @author SHMT-MES
 * @since 2025.10.24
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.10.24 SHMT-MES          최초 생성
 *
 * </pre>
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Tag(name="EgovProcessApiController", description = "공정 관리")
public class EgovProcessApiController {

    private final ResultVoHelper resultVoHelper;
    private final EgovProcessService processService;
    private final EgovPropertyService propertyService;

    /**
     * 공정 목록을 조회한다.
     */
    @Operation(
            summary = "공정 목록 조회",
            description = "공정 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/processes")
    public ResultVO selectProcessList(
            @ModelAttribute ProcessVO processVO,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        PaginationInfo paginationInfo = new PaginationInfo();
        paginationInfo.setCurrentPageNo(processVO.getPageIndex());
        paginationInfo.setRecordCountPerPage(
                processVO.getPageUnit() > 0 ? processVO.getPageUnit() : propertyService.getInt("Globals.pageUnit")
        );
        paginationInfo.setPageSize(propertyService.getInt("Globals.pageSize"));

        processVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
        processVO.setLastIndex(paginationInfo.getLastRecordIndex());
        processVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());

        Map<String, Object> resultMap = processService.selectProcessList(processVO);
        int totCnt = Integer.parseInt((String)resultMap.get("resultCnt"));
        paginationInfo.setTotalRecordCount(totCnt);
        
        resultMap.put("processVO", processVO);
        resultMap.put("paginationInfo", paginationInfo);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정 상세 정보를 조회한다.
     */
    @Operation(
            summary = "공정 상세 조회",
            description = "공정 상세 정보를 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/processes/{processId}")
    public ResultVO selectProcess(
            @PathVariable String processId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        Process process = processService.selectProcess(processId);
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("process", process);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정을 등록한다.
     */
    @Operation(
            summary = "공정 등록",
            description = "공정을 등록한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/processes")
    public ResultVO insertProcess(
            @RequestBody Process process,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        // 공정 코드 중복 체크
        if (processService.isProcessCodeExists(process.getProcessCode())) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("message", "이미 존재하는 공정 코드입니다.");
            errorMap.put("duplicateField", "processCode");
            errorMap.put("duplicateValue", process.getProcessCode());

            return resultVoHelper.buildFromMap(errorMap, ResponseCode.INPUT_CHECK_ERROR);
        }

        process.setRegUserId(user.getUniqId());
        processService.insertProcess(process);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공정이 등록되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정을 수정한다.
     */
    @Operation(
            summary = "공정 수정",
            description = "공정을 수정한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PutMapping("/processes/{processId}")
    public ResultVO updateProcess(
            @PathVariable String processId,
            @RequestBody Process process,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        process.setProcessId(processId);
        process.setUpdUserId(user.getUniqId());
        processService.updateProcess(process);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공정이 수정되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정을 삭제한다.
     */
    @Operation(
            summary = "공정 삭제",
            description = "공정을 삭제한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @DeleteMapping("/processes/{processId}")
    public ResultVO deleteProcess(
            @PathVariable String processId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processService.deleteProcess(processId);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공정이 삭제되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 작업장 목록을 조회한다.
     */
    @Operation(
            summary = "공정별 작업장 목록 조회",
            description = "공정별 작업장 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/processes/{processId}/workplaces")
    public ResultVO selectProcessWorkplaceList(
            @PathVariable String processId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        ProcessWorkplaceVO processWorkplaceVO = new ProcessWorkplaceVO();
        processWorkplaceVO.setProcessId(processId);
        
        List<ProcessWorkplaceVO> resultList = processService.selectProcessWorkplaceList(processWorkplaceVO);
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", resultList);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 작업장을 등록한다.
     */
    @Operation(
            summary = "공정별 작업장 등록",
            description = "공정별 작업장을 등록한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/processes/{processId}/workplaces")
    public ResultVO insertProcessWorkplace(
            @PathVariable String processId,
            @RequestBody ProcessWorkplace processWorkplace,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processWorkplace.setProcessId(processId);
        processWorkplace.setRegUserId(user.getUniqId());
        processService.insertProcessWorkplace(processWorkplace);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "작업장이 등록되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 작업장을 삭제한다.
     */
    @Operation(
            summary = "공정별 작업장 삭제",
            description = "공정별 작업장을 삭제한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @DeleteMapping("/processes/{processId}/workplaces/{processWorkplaceId}")
    public ResultVO deleteProcessWorkplace(
            @PathVariable String processId,
            @PathVariable String processWorkplaceId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processService.deleteProcessWorkplace(processWorkplaceId);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "작업장이 삭제되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 불량코드 목록을 조회한다.
     */
    @Operation(
            summary = "공정별 불량코드 목록 조회",
            description = "공정별 불량코드 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/processes/{processId}/defects")
    public ResultVO selectProcessDefectList(
            @PathVariable String processId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        ProcessDefectVO processDefectVO = new ProcessDefectVO();
        processDefectVO.setProcessId(processId);
        
        List<ProcessDefectVO> resultList = processService.selectProcessDefectList(processDefectVO);
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", resultList);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 불량코드를 등록한다.
     */
    @Operation(
            summary = "공정별 불량코드 등록",
            description = "공정별 불량코드를 등록한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/processes/{processId}/defects")
    public ResultVO insertProcessDefect(
            @PathVariable String processId,
            @RequestBody ProcessDefect processDefect,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processDefect.setProcessId(processId);
        processDefect.setRegUserId(user.getUniqId());
        processService.insertProcessDefect(processDefect);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "불량코드가 등록되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 불량코드를 수정한다.
     */
    @Operation(
            summary = "공정별 불량코드 수정",
            description = "공정별 불량코드를 수정한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PutMapping("/processes/{processId}/defects/{processDefectId}")
    public ResultVO updateProcessDefect(
            @PathVariable String processId,
            @PathVariable String processDefectId,
            @RequestBody ProcessDefect processDefect,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processDefect.setProcessId(processId);
        processDefect.setProcessDefectId(processDefectId);
        processDefect.setUpdUserId(user.getUniqId());
        processService.updateProcessDefect(processDefect);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "불량코드가 수정되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 불량코드를 삭제한다.
     */
    @Operation(
            summary = "공정별 불량코드 삭제",
            description = "공정별 불량코드를 삭제한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @DeleteMapping("/processes/{processId}/defects/{processDefectId}")
    public ResultVO deleteProcessDefect(
            @PathVariable String processId,
            @PathVariable String processDefectId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processService.deleteProcessDefect(processDefectId);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "불량코드가 삭제되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 검사항목 목록을 조회한다.
     */
    @Operation(
            summary = "공정별 검사항목 목록 조회",
            description = "공정별 검사항목 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/processes/{processId}/inspections")
    public ResultVO selectProcessInspectionList(
            @PathVariable String processId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        ProcessInspectionVO processInspectionVO = new ProcessInspectionVO();
        processInspectionVO.setProcessId(processId);
        
        List<ProcessInspectionVO> resultList = processService.selectProcessInspectionList(processInspectionVO);
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", resultList);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 검사항목을 등록한다.
     */
    @Operation(
            summary = "공정별 검사항목 등록",
            description = "공정별 검사항목을 등록한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/processes/{processId}/inspections")
    public ResultVO insertProcessInspection(
            @PathVariable String processId,
            @RequestBody ProcessInspection processInspection,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processInspection.setProcessId(processId);
        processInspection.setRegUserId(user.getUniqId());
        processService.insertProcessInspection(processInspection);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "검사항목이 등록되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 검사항목을 수정한다.
     */
    @Operation(
            summary = "공정별 검사항목 수정",
            description = "공정별 검사항목을 수정한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PutMapping("/processes/{processId}/inspections/{processInspectionId}")
    public ResultVO updateProcessInspection(
            @PathVariable String processId,
            @PathVariable String processInspectionId,
            @RequestBody ProcessInspection processInspection,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processInspection.setProcessId(processId);
        processInspection.setProcessInspectionId(processInspectionId);
        processInspection.setUpdUserId(user.getUniqId());
        processService.updateProcessInspection(processInspection);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "검사항목이 수정되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 검사항목을 삭제한다.
     */
    @Operation(
            summary = "공정별 검사항목 삭제",
            description = "공정별 검사항목을 삭제한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @DeleteMapping("/processes/{processId}/inspections/{processInspectionId}")
    public ResultVO deleteProcessInspection(
            @PathVariable String processId,
            @PathVariable String processInspectionId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processService.deleteProcessInspection(processInspectionId);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "검사항목이 삭제되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }
}
