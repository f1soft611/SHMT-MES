package egovframework.let.production.order.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.com.jwt.EgovJwtTokenUtil;
import egovframework.let.common.dto.ListResult;
import egovframework.let.cop.bbs.dto.request.BbsSearchRequestDTO;
import egovframework.let.production.order.domain.model.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.egovframe.rte.fdl.property.EgovPropertyService;
import egovframework.let.production.order.service.EgovProductionOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.ptl.mvc.tags.ui.pagination.PaginationInfo;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
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
@RequestMapping("/api/production-orders")
@Tag(name="EgovProductionOrderApiController",description = "생산 지시 관리")
public class EgovProductionOrderApiController {

    public static final String HEADER_STRING = "Authorization";
    private final EgovJwtTokenUtil jwtTokenUtil;
    private final ResultVoHelper resultVoHelper;
    private final EgovProductionOrderService productionOrderService;
    private final EgovPropertyService propertyService;

    /**
     * 생산 지시 목록을 조회한다.
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
    @GetMapping
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

    /**
     * 생산지시관리에서 사용하는 생산계획 목록 조회
     */

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @GetMapping("/plans")
    public ResultVO getProdPlans(
            @ModelAttribute ProdPlanSearchParam param,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {

        param.setOffset(page * size);
        param.setSize(size);

        ListResult<ProdPlanRow> data = productionOrderService.selectProdPlans(param);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", data.getResultList());
        resultMap.put("resultCnt", data.getResultCnt());
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);

    }

    /**
     * 생산지시관리에서 지시 내려지기 전 등록된 폼목별 공정 흐름 조회
     */
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @GetMapping("/process")
    public ResultVO getFlowProcessByItem(
            @ModelAttribute ProdOrderSearchParam param,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {

        ListResult<ProdOrderRow> data = productionOrderService.selectFlowProcessByPlanId(param);
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", data.getResultList());
        resultMap.put("user", user);
        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);

    }


    /**
     * 생산지시관리에서 계획id 로 저장된 생산지시 조회
     */
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @GetMapping("/orders")
    public ResultVO getProdOrdersByPlanId(
            @ModelAttribute ProdOrderSearchParam param,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {

        ListResult<ProdOrderRow> data = productionOrderService.selectProdOrdersByPlanId(param);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", data.getResultList());
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);

    }


    /**
     * 생산지시 저장
     */
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "저장 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping
    public ResultVO createProductionOrders(
            @RequestBody List<ProdOrderInsertDto> orders,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("user", user);

        try {
            // 로그인 사용자 세팅
            for (ProdOrderInsertDto dto : orders) {
                dto.setOpmanCode(user.getUniqId());
            }

            productionOrderService.insertProductionOrders(orders);
            return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS, "생산지시 등록이 완료되었습니다.");

        } catch (IllegalStateException e) {
            return resultVoHelper.buildFromMap(resultMap, ResponseCode.INPUT_CHECK_ERROR, e.getMessage());
        }
    }

    /**
     * 생산지시 수정
     */
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "저장 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/update")
    public ResultVO updateProductionOrders(
            @RequestBody List<ProdOrderUpdateDto> orders,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("user", user);

        try {
            // 로그인 사용자 세팅
            for (ProdOrderUpdateDto dto : orders) {
                dto.setOpmanCode(user.getUniqId());
            }

            productionOrderService.updateProductionOrders(orders);
            return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS, "생산지시 수정이 완료되었습니다.");

        } catch (IllegalStateException e) {
            return resultVoHelper.buildFromMap(resultMap, ResponseCode.INPUT_CHECK_ERROR, e.getMessage());
        }
    }




    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "저장 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/delete")
    public ResultVO deleteProductionOrders(
            @RequestBody ProdOrderDeleteDto order,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user
    ) throws Exception {

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("user", user);
        try {
            productionOrderService.deleteProductionOrder(order);
            return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS, "생산지시 삭제가 완료되었습니다.");
        } catch (IllegalStateException e) {
            return resultVoHelper.buildFromMap(resultMap, ResponseCode.DELETE_ERROR, e.getMessage());
        }

    }


}
