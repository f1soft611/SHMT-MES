package egovframework.let.basedata.bom.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.let.basedata.bom.domain.model.BomItemSearchRequestDTO;
import egovframework.let.basedata.bom.domain.model.BomItemSearchRow;
import egovframework.let.basedata.bom.domain.model.BomTreeRow;
import egovframework.let.basedata.bom.service.BomInquiryService;
import egovframework.let.common.dto.ListResult;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * BOM(제품별공정별소요자재) 조회를 위한 컨트롤러 클래스
 * @author SHMT-MES
 * @since 2026.07.29
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Tag(name = "BomInquiryApiController", description = "BOM 조회")
public class BomInquiryApiController {

    private final ResultVoHelper resultVoHelper;
    private final BomInquiryService bomInquiryService;
    private final EgovPropertyService propertyService;

    /**
     * BOM 조회 대상 품목을 검색한다.
     */
    @Operation(
            summary = "BOM 조회용 품목 검색",
            description = "검색조건(1:품목코드, 2:품목명)과 검색어로 품목을 페이징 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"BomInquiryApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/bom/items")
    public ResultVO searchBomItems(
            @ModelAttribute BomItemSearchRequestDTO searchVO,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        PaginationInfo paginationInfo = new PaginationInfo();
        paginationInfo.setCurrentPageNo(searchVO.getPageIndex());
        paginationInfo.setRecordCountPerPage(
                searchVO.getPageUnit() > 0 ? searchVO.getPageUnit() : propertyService.getInt("Globals.pageUnit"));
        paginationInfo.setPageSize(propertyService.getInt("Globals.pageSize"));

        searchVO.setFactoryCode(user.getFactoryCode());
        searchVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
        searchVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());

        ListResult<BomItemSearchRow> result = bomInquiryService.searchItems(searchVO);
        paginationInfo.setTotalRecordCount(result.getResultCnt());

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", result.getResultList());
        resultMap.put("resultCnt", result.getResultCnt());
        resultMap.put("paginationInfo", paginationInfo);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 선택한 품목을 루트로 한 BOM 트리를 조회한다.
     */
    @Operation(
            summary = "BOM 트리 조회",
            description = "선택한 품목을 루트로 품목-공정-자재 다단계 BOM 트리를 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"BomInquiryApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/bom/tree")
    public ResultVO getBomTree(@RequestParam int itemSeq) throws Exception {
        List<BomTreeRow> tree = bomInquiryService.getBomTree(itemSeq);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("tree", tree);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }
}
