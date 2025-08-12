package egovframework.let.interfacelog.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.com.jwt.EgovJwtTokenUtil;
import egovframework.let.cop.bbs.dto.request.BbsSearchRequestDTO;
import egovframework.let.interfacelog.domain.model.InterfaceLogVO;
import egovframework.let.interfacelog.service.EgovInterfaceLogService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

/**
 * 인터페이스 로그를 관리하기 위한 컨트롤러 클래스
 * @author 김기형
 * @since 2025.01.20
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.01.20 AI Assistant     최초 생성
 *
 * </pre>
 */
@RestController
@RequiredArgsConstructor
@Tag(name="EgovInterfaceLogApiController",description = "인터페이스 로그 관리")
public class EgovInterfaceLogApiController {

    public static final String HEADER_STRING = "Authorization";
    private final EgovJwtTokenUtil jwtTokenUtil;
    private final ResultVoHelper resultVoHelper;
    private final EgovInterfaceLogService interfaceLogService;
    private final EgovPropertyService propertyService;

    /**
     * 인터페이스 로그 목록을 조회한다.
     *
     * @param searchVO
     * @return resultVO
     * @throws Exception
     */
    @Operation(
            summary = "인터페이스 로그 목록 조회",
            description = "인터페이스 로그 목록을 조회",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovInterfaceLogApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
    })
    @GetMapping(value ="/interface-logs")
    public ResultVO selectInterfaceLogList(@ModelAttribute InterfaceLogVO searchVO,
                                        @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user)
            throws Exception {

        PaginationInfo paginationInfo = new PaginationInfo();
        paginationInfo.setCurrentPageNo(searchVO.getPageIndex());
        paginationInfo.setRecordCountPerPage(
                searchVO.getPageUnit() > 0 ? searchVO.getPageUnit() : propertyService.getInt("Globals.pageUnit")
        );
        paginationInfo.setPageSize(propertyService.getInt("Globals.pageSize"));

        InterfaceLogVO interfaceLogVO = new InterfaceLogVO();
        interfaceLogVO.setPageIndex(searchVO.getPageIndex());
        interfaceLogVO.setSearchCnd(searchVO.getSearchCnd());
        interfaceLogVO.setSearchWrd(searchVO.getSearchWrd());
        interfaceLogVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
        interfaceLogVO.setLastIndex(paginationInfo.getLastRecordIndex());
        interfaceLogVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());

        Map<String, Object> resultMap = interfaceLogService.selectInterfaceLogList(interfaceLogVO);
        int totCnt = Integer.parseInt((String)resultMap.get("resultCnt"));
        paginationInfo.setTotalRecordCount(totCnt);
        resultMap.put("interfaceLogVO", interfaceLogVO);
        resultMap.put("paginationInfo", paginationInfo);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }

    /**
     * 인터페이스 로그 상세 정보를 조회한다.
     *
     * @param logNo
     * @return resultVO
     * @throws Exception
     */
    @Operation(
            summary = "인터페이스 로그 상세 조회",
            description = "인터페이스 로그 상세 정보를 조회",
            security = {@SecurityRequirement(name = "Authorization")},
            tags = {"EgovInterfaceLogApiController"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님"),
            @ApiResponse(responseCode = "404", description = "데이터를 찾을 수 없음")
    })
    @GetMapping(value ="/interface-logs/{logNo}")
    public ResultVO selectInterfaceLogDetail(@Parameter(description = "로그 번호") @PathVariable Long logNo,
                                           @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user)
            throws Exception {

        InterfaceLogVO interfaceLogVO = interfaceLogService.selectInterfaceLogDetail(logNo);
        if (interfaceLogVO == null) {
            return resultVoHelper.buildFromMap(new HashMap<>(), ResponseCode.INPUT_CHECK_ERROR);
        }

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("interfaceLog", interfaceLogVO);
        resultMap.put("user", user);

        return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
    }
}