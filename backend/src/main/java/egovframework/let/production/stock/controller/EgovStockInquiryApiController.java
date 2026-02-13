package egovframework.let.production.stock.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.let.production.stock.domain.model.StockInquiryVO;
import egovframework.let.production.stock.service.EgovStockInquiryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 재고조회를 관리하기 위한 컨트롤러 클래스
 * @author SHMT-MES
 * @since 2026.02.13
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2026.02.13 SHMT-MES          최초 생성
 *
 * </pre>
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Tag(name="EgovStockInquiryApiController", description = "재고조회 관리")
public class EgovStockInquiryApiController {

	private final ResultVoHelper resultVoHelper;
	private final EgovStockInquiryService stockInquiryService;

	/**
	 * ERP 프로시저를 호출하여 재고 목록을 조회한다.
	 *
	 * @param searchVO 검색 조건
	 * @param user 사용자 정보
	 * @return ResultVO
	 * @throws Exception
	 */
	@Operation(
			summary = "재고 목록 조회",
			description = "ERP 프로시저(SHM_IF_SLGWHStockListQuery)를 호출하여 재고 목록을 조회한다.",
			security = {@SecurityRequirement(name = "Authorization")},
			tags = {"EgovStockInquiryApiController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
	})
	@GetMapping(value = "/stock-inquiry")
	public ResultVO selectStockList(
			@ModelAttribute StockInquiryVO searchVO,
			@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

		Map<String, Object> resultMap = stockInquiryService.selectStockList(searchVO);

		return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
	}
}
