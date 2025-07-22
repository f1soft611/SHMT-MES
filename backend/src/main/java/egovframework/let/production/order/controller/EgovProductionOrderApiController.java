package egovframework.let.production.order.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.com.jwt.EgovJwtTokenUtil;
import egovframework.let.cop.bbs.dto.request.BbsSearchRequestDTO;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.egovframe.rte.fdl.property.EgovPropertyService;
import egovframework.let.production.order.domain.model.ProductionOrderVO;
import egovframework.let.production.order.service.EgovProductionOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.ptl.mvc.tags.ui.pagination.PaginationInfo;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

/**
 * 생산 지시를 관리하기 위한 컨트롤러 클래스
 * @author 김기형
 * @since 2025.07.22
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.07.22 김기형          최초 생성
 *
 * </pre>
 */
@RestController
@RequiredArgsConstructor
@Tag(name="EgovProductionOrderApiController",description = "생산 지시 관리")
public class EgovProductionOrderApiController {

    public static final String HEADER_STRING = "Authorization";
    private final EgovJwtTokenUtil jwtTokenUtil;
    private final ResultVoHelper resultVoHelper;
    private final EgovProductionOrderService productionOrderService;
    private final EgovPropertyService propertyService;

    /**
     * 게시판 사용정보 목록을 조회한다.
     *
     * @param boardMasterSearchVO
     * @return resultVO
     * @throws Exception
     */
    @Operation(
            summary = "생산 지시 목록 조회",
            description = "생산 지시 목록을 조회",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovProductionOrderApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping(value ="/production-orders")
    public ResultVO selectProductionOrderList(@ModelAttribute BbsSearchRequestDTO boardMasterSearchVO,
                                        @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user)
            throws Exception {

//        BbsDetailResponse response = bbsAttrbService.selectBBSMasterInf(boardMasterSearchVO.getBbsId(), user.getUniqId(), BbsDetailRequestType.DETAIL);
        PaginationInfo paginationInfo = new PaginationInfo();
        paginationInfo.setCurrentPageNo(boardMasterSearchVO.getPageIndex());
        paginationInfo.setRecordCountPerPage(propertyService.getInt("Globals.pageUnit"));
        paginationInfo.setPageSize(propertyService.getInt("Globals.pageSize"));
//
        ProductionOrderVO productionOrderVO = new ProductionOrderVO();
//        boardVO.setPageIndex(boardMasterSearchVO.getPageIndex());
//        boardVO.setBbsId(boardMasterSearchVO.getBbsId());
//        boardVO.setSearchCnd(boardMasterSearchVO.getSearchCnd());
//        boardVO.setSearchWrd(boardMasterSearchVO.getSearchWrd());
//
//        boardVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
//        boardVO.setLastIndex(paginationInfo.getLastRecordIndex());
//        boardVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());
//
        Map<String, Object> resultMap = productionOrderService.selectProductionOrderList(productionOrderVO, "");
        int totCnt = Integer.parseInt((String)resultMap.get("resultCnt"));
        paginationInfo.setTotalRecordCount(totCnt);
        resultMap.put("productionOrderVO", productionOrderVO);
        resultMap.put("paginationInfo", paginationInfo);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }
}
