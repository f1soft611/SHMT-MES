package egovframework.let.production.wipInventory.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.let.common.dto.ListResult;
import egovframework.let.production.wipInventory.domain.model.WipInventoryRow;
import egovframework.let.production.wipInventory.domain.model.WipInventorySearchDto;
import egovframework.let.production.wipInventory.service.EgovWipInventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 재공재고 관리하기 위한 컨트롤러 클래스
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
@Tag(name="EgovWipInventoryApiController", description = "재공재고 관리")
public class EgovWipInventoryApiController {

	private final ResultVoHelper resultVoHelper;
	private final EgovWipInventoryService  wipInventoryService;

	/**
	 * ERP 프로시저를 호출하여 재공재고 목록을 조회한다.
	 *
	 * @param searchVO 검색 조건
	 * @param user 사용자 정보
	 * @return ResultVO
	 * @throws Exception
	 */
	@Operation(
			summary = "재공재고 목록 조회",
			security = {@SecurityRequirement(name = "Authorization")},
			tags = {"EgovWipInventoryApiController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
	})
	@GetMapping(value = "/wip-inventory")
	public ResultVO selectWipInventoryList(
			@ModelAttribute WipInventorySearchDto searchVO,
			@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

		ListResult<WipInventoryRow> data = wipInventoryService.selectWipInventoryList(searchVO);

		Map<String, Object> resultMap = new HashMap<>();
		resultMap.put("resultList", data.getResultList());
		resultMap.put("resultCnt", data.getResultCnt());
		resultMap.put("user", user);

		return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
	}
}
