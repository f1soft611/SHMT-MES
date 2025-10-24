package egovframework.let.basedata.item.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.let.basedata.item.domain.model.Item;
import egovframework.let.basedata.item.domain.model.ItemVO;
import egovframework.let.basedata.item.service.EgovItemService;
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
 * 품목 관리를 위한 컨트롤러 클래스
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
@Tag(name="EgovItemApiController", description = "품목 관리")
public class EgovItemApiController {

    private final ResultVoHelper resultVoHelper;
    private final EgovItemService itemService;
    private final EgovPropertyService propertyService;

    /**
     * 품목 목록을 조회한다.
     */
    @Operation(
            summary = "품목 목록 조회",
            description = "품목 목록을 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovItemApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/items")
    public ResultVO selectItemList(
            @ModelAttribute ItemVO itemVO,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        PaginationInfo paginationInfo = new PaginationInfo();
        paginationInfo.setCurrentPageNo(itemVO.getPageIndex());
        paginationInfo.setRecordCountPerPage(propertyService.getInt("Globals.pageUnit"));
        paginationInfo.setPageSize(propertyService.getInt("Globals.pageSize"));

        itemVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
        itemVO.setLastIndex(paginationInfo.getLastRecordIndex());
        itemVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());

        Map<String, Object> resultMap = itemService.selectItemList(itemVO);
        int totCnt = Integer.parseInt((String)resultMap.get("resultCnt"));
        paginationInfo.setTotalRecordCount(totCnt);
        
        resultMap.put("itemVO", itemVO);
        resultMap.put("paginationInfo", paginationInfo);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 품목 상세 정보를 조회한다.
     */
    @Operation(
            summary = "품목 상세 조회",
            description = "품목 상세 정보를 조회한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovItemApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping("/items/{itemId}")
    public ResultVO selectItem(
            @PathVariable String itemId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        Item item = itemService.selectItem(itemId);
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("item", item);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 품목을 등록한다.
     */
    @Operation(
            summary = "품목 등록",
            description = "품목을 등록한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovItemApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PostMapping("/items")
    public ResultVO insertItem(
            @RequestBody Item item,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        // 품목 코드 중복 체크
        if (itemService.isItemCodeExists(item.getItemCode())) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("message", "이미 존재하는 품목 코드입니다.");
            errorMap.put("duplicateField", "itemCode");
            errorMap.put("duplicateValue", item.getItemCode());

            return resultVoHelper.buildFromMap(errorMap, ResponseCode.INPUT_CHECK_ERROR);
        }

        item.setRegUserId(user.getUniqId());
        itemService.insertItem(item);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "품목이 등록되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 품목을 수정한다.
     */
    @Operation(
            summary = "품목 수정",
            description = "품목을 수정한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovItemApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @PutMapping("/items/{itemId}")
    public ResultVO updateItem(
            @PathVariable String itemId,
            @RequestBody Item item,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        item.setItemId(itemId);
        item.setUpdUserId(user.getUniqId());
        itemService.updateItem(item);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "품목이 수정되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 품목을 삭제한다.
     */
    @Operation(
            summary = "품목 삭제",
            description = "품목을 삭제한다",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovItemApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @DeleteMapping("/items/{itemId}")
    public ResultVO deleteItem(
            @PathVariable String itemId,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

        itemService.deleteItem(itemId);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("message", "품목이 삭제되었습니다.");

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }
}
