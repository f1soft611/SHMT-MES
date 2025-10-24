package egovframework.let.basedata.commoncode.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.let.basedata.commoncode.domain.model.CommonCode;
import egovframework.let.basedata.commoncode.domain.model.CommonCodeVO;
import egovframework.let.basedata.commoncode.domain.model.CommonDetailCode;
import egovframework.let.basedata.commoncode.service.EgovCommonCodeService;
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
 * MES 공통코드 관리를 위한 컨트롤러 클래스
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
@Tag(name="EgovCommonCodeApiController", description = "공통코드 관리")
public class EgovCommonCodeApiController {

    private final ResultVoHelper resultVoHelper;
    private final EgovCommonCodeService commonCodeService;
    private final EgovPropertyService propertyService;

    /**
     * 공통코드 목록을 조회한다.
     */
    @Operation(
            summary = "공통코드 목록 조회",
            description = "공통코드 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovCommonCodeApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/common-codes")
    public ResultVO selectCommonCodeList(
            @ModelAttribute CommonCodeVO commonCodeVO,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        PaginationInfo paginationInfo = new PaginationInfo();
        paginationInfo.setCurrentPageNo(commonCodeVO.getPageIndex());
        paginationInfo.setRecordCountPerPage(
                commonCodeVO.getPageUnit() > 0 ? commonCodeVO.getPageUnit() : propertyService.getInt("Globals.pageUnit")
        );
        paginationInfo.setPageSize(propertyService.getInt("Globals.pageSize"));

        commonCodeVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
        commonCodeVO.setLastIndex(paginationInfo.getLastRecordIndex());
        commonCodeVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());

        Map<String, Object> resultMap = commonCodeService.selectCommonCodeList(commonCodeVO);
        int totCnt = Integer.parseInt((String)resultMap.get("resultCnt"));
        paginationInfo.setTotalRecordCount(totCnt);
        
        resultMap.put("commonCodeVO", commonCodeVO);
        resultMap.put("paginationInfo", paginationInfo);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공통코드 상세 정보를 조회한다.
     */
    @Operation(
            summary = "공통코드 상세 조회",
            description = "공통코드 상세 정보를 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovCommonCodeApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/common-codes/{codeId}")
    public ResultVO selectCommonCode(
            @PathVariable String codeId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        CommonCode commonCode = commonCodeService.selectCommonCode(codeId);
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("commonCode", commonCode);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공통코드를 등록한다.
     */
    @Operation(
            summary = "공통코드 등록",
            description = "공통코드를 등록한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovCommonCodeApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/common-codes")
    public ResultVO insertCommonCode(
            @RequestBody CommonCode commonCode,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        // 코드 ID 중복 체크
        if (commonCodeService.isCodeIdExists(commonCode.getCodeId())) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("message", "이미 존재하는 코드 ID입니다.");
            errorMap.put("duplicateField", "codeId");
            errorMap.put("duplicateValue", commonCode.getCodeId());

            return resultVoHelper.buildFromMap(errorMap, ResponseCode.INPUT_CHECK_ERROR);
        }

        commonCode.setFrstRegisterId(user.getUniqId());
        commonCodeService.insertCommonCode(commonCode);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공통코드가 등록되었습니다.");
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공통코드를 수정한다.
     */
    @Operation(
            summary = "공통코드 수정",
            description = "공통코드를 수정한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovCommonCodeApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PutMapping("/common-codes/{codeId}")
    public ResultVO updateCommonCode(
            @PathVariable String codeId,
            @RequestBody CommonCode commonCode,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        commonCode.setCodeId(codeId);
        commonCode.setLastUpdusrId(user.getUniqId());
        commonCodeService.updateCommonCode(commonCode);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공통코드가 수정되었습니다.");
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공통코드를 삭제한다.
     */
    @Operation(
            summary = "공통코드 삭제",
            description = "공통코드를 삭제한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovCommonCodeApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @DeleteMapping("/common-codes/{codeId}")
    public ResultVO deleteCommonCode(
            @PathVariable String codeId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        commonCodeService.deleteCommonCode(codeId);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공통코드가 삭제되었습니다.");
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공통코드 상세 목록을 조회한다.
     */
    @Operation(
            summary = "공통코드 상세 목록 조회",
            description = "공통코드 상세 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovCommonCodeApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/common-codes/{codeId}/details")
    public ResultVO selectCommonDetailCodeList(
            @PathVariable String codeId,
            @RequestParam(required = false) String useAt,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        List<CommonDetailCode> detailCodeList;
        if (useAt != null && !useAt.isEmpty()) {
            detailCodeList = commonCodeService.selectCommonDetailCodeListByUseAt(codeId, useAt);
        } else {
            detailCodeList = commonCodeService.selectCommonDetailCodeList(codeId);
        }
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("detailCodeList", detailCodeList);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공통코드 상세 정보를 조회한다.
     */
    @Operation(
            summary = "공통코드 상세 정보 조회",
            description = "공통코드 상세 정보를 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovCommonCodeApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/common-codes/{codeId}/details/{code}")
    public ResultVO selectCommonDetailCode(
            @PathVariable String codeId,
            @PathVariable String code,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        CommonDetailCode detailCode = commonCodeService.selectCommonDetailCode(codeId, code);
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("detailCode", detailCode);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공통코드 상세를 등록한다.
     */
    @Operation(
            summary = "공통코드 상세 등록",
            description = "공통코드 상세를 등록한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovCommonCodeApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/common-codes/{codeId}/details")
    public ResultVO insertCommonDetailCode(
            @PathVariable String codeId,
            @RequestBody CommonDetailCode detailCode,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        // 코드 중복 체크
        if (commonCodeService.isCodeExists(codeId, detailCode.getCode())) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("message", "이미 존재하는 코드입니다.");
            errorMap.put("duplicateField", "code");
            errorMap.put("duplicateValue", detailCode.getCode());

            return resultVoHelper.buildFromMap(errorMap, ResponseCode.INPUT_CHECK_ERROR);
        }

        detailCode.setCodeId(codeId);
        detailCode.setFrstRegisterId(user.getUniqId());
        commonCodeService.insertCommonDetailCode(detailCode);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공통코드 상세가 등록되었습니다.");
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공통코드 상세를 수정한다.
     */
    @Operation(
            summary = "공통코드 상세 수정",
            description = "공통코드 상세를 수정한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovCommonCodeApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PutMapping("/common-codes/{codeId}/details/{code}")
    public ResultVO updateCommonDetailCode(
            @PathVariable String codeId,
            @PathVariable String code,
            @RequestBody CommonDetailCode detailCode,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        detailCode.setCodeId(codeId);
        detailCode.setCode(code);
        detailCode.setLastUpdusrId(user.getUniqId());
        commonCodeService.updateCommonDetailCode(detailCode);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공통코드 상세가 수정되었습니다.");
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 공통코드 상세를 삭제한다.
     */
    @Operation(
            summary = "공통코드 상세 삭제",
            description = "공통코드 상세를 삭제한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovCommonCodeApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @DeleteMapping("/common-codes/{codeId}/details/{code}")
    public ResultVO deleteCommonDetailCode(
            @PathVariable String codeId,
            @PathVariable String code,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        commonCodeService.deleteCommonDetailCode(codeId, code);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "공통코드 상세가 삭제되었습니다.");
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }
}
