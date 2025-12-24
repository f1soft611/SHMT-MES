package egovframework.let.basedata.processFlow.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlow;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowItem;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowProcess;
import egovframework.let.basedata.processFlow.domain.model.ProcessFlowVO;
import egovframework.let.basedata.processFlow.service.EgovProcessFlowService;
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
 * 공정 흐름 관리를 위한 컨트롤러 클래스
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
 *   2025.11.11 SHMT-MES          최초 생성
 *
 * </pre>
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/processflow")
@Tag(name="EgovProcessFlowApiController", description = "공정 흐름 관리")
public class EgovProcessFlowApiController {

    private final ResultVoHelper resultVoHelper;
    private final EgovProcessFlowService processFlowService;
    private final EgovPropertyService propertyService;

    /**
     * 공정 흐름 목록을 조회한다.
     */
    @Operation(
            summary = "공정 흐름 목록 조회",
            description = "공정 흐름 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessFlowApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping
    public ResultVO selectProcessFlowList(
            @ModelAttribute ProcessFlowVO processFlowVO,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        PaginationInfo paginationInfo = new PaginationInfo();
        paginationInfo.setCurrentPageNo(processFlowVO.getPageIndex());
        paginationInfo.setRecordCountPerPage(
                processFlowVO.getPageUnit() > 0 ? processFlowVO.getPageUnit() : propertyService.getInt("Globals.pageUnit")
        );
        paginationInfo.setPageSize(propertyService.getInt("Globals.pageSize"));

        processFlowVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
        processFlowVO.setLastIndex(paginationInfo.getLastRecordIndex());
        processFlowVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());

        Map<String, Object> resultMap = processFlowService.selectProcessFlowList(processFlowVO);
//        int totCnt = Integer.parseInt((String)resultMap.get("resultCnt"));
//        paginationInfo.setTotalRecordCount(totCnt);

        resultMap.put("processFlowVO", processFlowVO);
        resultMap.put("paginationInfo", paginationInfo);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정 흐름을 등록한다.
     */
    @Operation(
            summary = "공정 흐름 등록",
            description = "새로운 공정 흐름을 등록한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessFlowApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping
    public ResultVO createProcessFlow(
            @RequestBody ProcessFlow processFlow,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        processFlow.setRegUserId(user.getUniqId());
        processFlowService.createProcessFlow(processFlow);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공정흐름이 등록되었습니다.");
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }


    /**
     * 공정 흐름을 수정한다.
     */
    @Operation(
            summary = "공정 흐름 수정",
            description = "기존 공정 흐름 정보를 수정한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessFlowApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "404", description = "대상이 존재하지 않음"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PutMapping("/{processFlowId}")
    public ResultVO updateProcessFlow(
            @PathVariable("processFlowId") String processFlowId,
            @RequestBody ProcessFlow processFlow,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {

        // ✅ 수정자 정보 세팅
        processFlow.setUpdUserId(user.getUniqId());
        processFlow.setProcessFlowId(processFlowId);

        processFlowService.updateProcessFlow(processFlow);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공정흐름이 수정되었습니다.");
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }


    /**
     * 공정 흐름을 삭제한다.
     */
    @Operation(
            summary = "공정 흐름 삭제",
            description = "선택한 공정 흐름을 삭제한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessFlowApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "404", description = "대상이 존재하지 않음"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @DeleteMapping("/{processFlowId}")
    public ResultVO deleteProcessFlow(
            @PathVariable("processFlowId") String processFlowId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {

        processFlowService.deleteProcessFlow(processFlowId);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공정흐름이 삭제되었습니다.");
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }


    /**
     * 공정흐름별 공정 저장
     */
    @Operation(
            summary = "공정흐름별 공정 저장",
            description = "선택한 공정흐름에 대한 공정 목록을 저장한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessFlowApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "저장 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/{processFlowId}/process")
    public ResultVO createProcessFlowProcess(
            @PathVariable("processFlowId") String processFlowId,
            @RequestBody List<ProcessFlowProcess> processList,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {

        // 사용자 ID 세팅
        for (ProcessFlowProcess p : processList) {
            p.setRegUserId(user.getUniqId());
        }

        // 저장 서비스 호출
        processFlowService.createProcessFlowProcess(processFlowId, processList);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공정흐름별 공정이 저장되었습니다.");
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }



    /**
     * 공정흐름별 공정 목록 조회
     */
    @Operation(
            summary = "공정흐름별 공정 조회",
            description = "선택한 공정흐름에 포함된 공정 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessFlowApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @GetMapping("/{processFlowId}/process")
    public ResultVO selectProcessByFlowId(
            @PathVariable("processFlowId") String processFlowId
    ) throws Exception {

        List<ProcessFlowProcess> processList = processFlowService.selectProcessByFlowId(processFlowId);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", processList);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공정흐름별 제품 저장
     */
    @Operation(
            summary = "공정흐름별 제품 저장",
            description = "선택한 공정흐름에 대한 제품 목록을 저장한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessFlowApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "저장 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/{processFlowId}/item")
    public ResultVO createProcessFlowItem(
            @PathVariable("processFlowId") String processFlowId,
            @RequestBody List<ProcessFlowItem> itemList,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {
        // 사용자 ID 세팅
        for (ProcessFlowItem it : itemList) {
            it.setRegUserId(user.getId());
        }
        processFlowService.createProcessFlowItem(processFlowId, itemList);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공정흐름별 품목이 저장되었습니다.");
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }


    /**
     * 공정흐름별 품목 목록 조회
     */
    @Operation(
            summary = "공정흐름별 품목 조회",
            description = "선택한 공정흐름에 포함된 품목 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProcessFlowApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @GetMapping("/{processFlowId}/item")
    public ResultVO selectItemByFlowId(
            @PathVariable("processFlowId") String processFlowId
    ) throws Exception {

        List<ProcessFlowItem> itemList = processFlowService.selectItemByFlowId(processFlowId);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", itemList);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

}
