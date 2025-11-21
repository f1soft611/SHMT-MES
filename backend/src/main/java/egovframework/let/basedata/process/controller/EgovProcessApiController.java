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
import org.egovframe.rte.fdl.cmmn.exception.BaseException;
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

    /**
     * 공정별 중지항목 목록을 조회한다.
     */
    @Operation(
            summary = "공정별 중지항목 목록 조회",
            description = "공정별 중지항목 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/processes/{processId}/stopitems")
    public ResultVO selectProcessStopItemList(
            @PathVariable String processId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        ProcessStopItemVO processStopItemVO = new ProcessStopItemVO();
        processStopItemVO.setProcessId(processId);
        
        List<ProcessStopItemVO> resultList = processService.selectProcessStopItemList(processStopItemVO);
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", resultList);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 중지항목을 등록한다.
     */
    @Operation(
            summary = "공정별 중지항목 등록",
            description = "공정별 중지항목을 등록한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/processes/{processId}/stopitems")
    public ResultVO insertProcessStopItem(
            @PathVariable String processId,
            @RequestBody ProcessStopItem processStopItem,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processStopItem.setProcessId(processId);
        processStopItem.setRegUserId(user.getUniqId());
        processService.insertProcessStopItem(processStopItem);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "중지항목이 등록되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 중지항목을 수정한다.
     */
    @Operation(
            summary = "공정별 중지항목 수정",
            description = "공정별 중지항목을 수정한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PutMapping("/processes/{processId}/stopitems/{processStopItemId}")
    public ResultVO updateProcessStopItem(
            @PathVariable String processId,
            @PathVariable String processStopItemId,
            @RequestBody ProcessStopItem processStopItem,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processStopItem.setProcessId(processId);
        processStopItem.setProcessStopItemId(processStopItemId);
        processStopItem.setUpdUserId(user.getUniqId());
        processService.updateProcessStopItem(processStopItem);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "중지항목이 수정되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 중지항목을 삭제한다.
     */
    @Operation(
            summary = "공정별 중지항목 삭제",
            description = "공정별 중지항목을 삭제한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @DeleteMapping("/processes/{processId}/stopitems/{processStopItemId}")
    public ResultVO deleteProcessStopItem(
            @PathVariable String processId,
            @PathVariable String processStopItemId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processService.deleteProcessStopItem(processStopItemId);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "중지항목이 삭제되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 설비 목록을 조회한다.
     */
    @Operation(
            summary = "공정별 설비 목록 조회",
            description = "공정별 설비 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/processes/{processId}/equipments")
    public ResultVO selectProcessEquipmentList(
            @PathVariable String processId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        ProcessEquipmentVO processEquipmentVO = new ProcessEquipmentVO();
        processEquipmentVO.setProcessId(processId);
        
        List<ProcessEquipmentVO> resultList = processService.selectProcessEquipmentList(processEquipmentVO);
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", resultList);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정별 설비를 등록한다.
     */
    @Operation(
            summary = "공정별 설비 등록",
            description = "공정별 설비를 등록한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/processes/{processId}/equipments")
    public ResultVO insertProcessEquipment(
            @PathVariable String processId,
            @RequestBody ProcessEquipment processEquipment,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processEquipment.setProcessId(processId);
        processEquipment.setRegUserId(user.getUniqId());
        
        try {
            processService.insertProcessEquipment(processEquipment);
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("message", "설비가 등록되었습니다.");
            return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
        } catch (BaseException e) {
            Map<String, Object> resultMap = new HashMap<>();

            // cause에서 원본 메시지 추출
            String errorMessage = e.getMessage();
            if (e.getCause() != null && e.getCause().getMessage() != null) {
                String causeMessage = e.getCause().getMessage();
                // "이미 등록된 설비입니다"로 시작하면 중복 에러
                if (causeMessage.startsWith("이미 등록된 설비입니다")) {
                    errorMessage = causeMessage;
                    resultMap.put("message", errorMessage);
                    return resultVoHelper.buildFromMap(resultMap, ResponseCode.SAVE_ERROR);
                }
                errorMessage = causeMessage;
            }

            resultMap.put("message", errorMessage);
            return resultVoHelper.buildFromMap(resultMap, ResponseCode.SAVE_ERROR);

        } catch (Exception e) {
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("message", "설비 등록 중 오류가 발생했습니다.");
            return resultVoHelper.buildFromMap(resultMap, ResponseCode.SAVE_ERROR);
        }
    }

    /**
     * 공정별 설비를 수정한다.
     */
    @Operation(
            summary = "공정별 설비 수정",
            description = "공정별 설비를 수정한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PutMapping("/processes/{processId}/equipments/{processEquipmentId}")
    public ResultVO updateProcessEquipment(
            @PathVariable String processId,
            @PathVariable String processEquipmentId,
            @RequestBody ProcessEquipment processEquipment,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processEquipment.setProcessId(processId);
        processEquipment.setProcessEquipmentId(processEquipmentId);
        processEquipment.setUpdUserId(user.getUniqId());
        
        try {
            processService.updateProcessEquipment(processEquipment);
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("message", "설비가 수정되었습니다.");
            return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
        }  catch (BaseException e) {
            Map<String, Object> resultMap = new HashMap<>();

            // cause에서 원본 메시지 추출
            String errorMessage = e.getMessage();
            if (e.getCause() != null && e.getCause().getMessage() != null) {
                String causeMessage = e.getCause().getMessage();
                // "이미 등록된 설비입니다"로 시작하면 중복 에러
                if (causeMessage.startsWith("이미 등록된 설비입니다")) {
                    errorMessage = causeMessage;
                    resultMap.put("message", errorMessage);
                    return resultVoHelper.buildFromMap(resultMap, ResponseCode.SAVE_ERROR);
                }
                errorMessage = causeMessage;
            }

            resultMap.put("message", errorMessage);
            return resultVoHelper.buildFromMap(resultMap, ResponseCode.SAVE_ERROR);

        } catch (Exception e) {
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("message", e.getMessage());
            return resultVoHelper.buildFromMap(resultMap, ResponseCode.SAVE_ERROR);
        }
    }

    /**
     * 공정별 설비를 삭제한다.
     */
    @Operation(
            summary = "공정별 설비 삭제",
            description = "공정별 설비를 삭제한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @DeleteMapping("/processes/{processId}/equipments/{processEquipmentId}")
    public ResultVO deleteProcessEquipment(
            @PathVariable String processId,
            @PathVariable String processEquipmentId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processService.deleteProcessEquipment(processEquipmentId);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "설비가 삭제되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }
}
