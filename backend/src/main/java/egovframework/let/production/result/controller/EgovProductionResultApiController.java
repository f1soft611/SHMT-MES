package egovframework.let.production.result.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.let.production.plan.domain.model.ProductionPlanVO;
import egovframework.let.production.result.service.EgovProductionResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.egovframe.rte.fdl.property.EgovPropertyService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 생산실적을 관리하기 위한 컨트롤러 클래스
 * @author SHMT-MES
 * @since 2025.11.21
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.11.21 SHMT-MES          최초 생성
 *
 * </pre>
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/production-results")
@Tag(name="EgovProductionPlanApiController", description = "생산실적 관리")
public class EgovProductionResultApiController {

	private final ResultVoHelper resultVoHelper;
	private final EgovProductionResultService productionResultService;
	private final EgovPropertyService propertyService;

	/**
	 * 작업지시 목록을 조회한다.
	 *
	 * @param searchVO 검색 조건
	 * @param user 사용자 정보
	 * @return ResultVO
	 * @throws Exception
	 */
	@Operation(
			summary = "작업지시 목록 조회",
			description = "작업지시 목록을 조회한다.",
			security = {@SecurityRequirement(name = "Authorization")},
			tags = {"EgovProductionResultApiController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
	})
	@GetMapping
	public ResultVO selectProductionOrderList(
			@RequestParam Map<String, String> searchVO,
			@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

		Map<String, Object> resultMap = productionResultService.selectProductionOrderList(searchVO, user);

		return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
	}


	/**
	 * 생산실적을 등록한다
	 *
	 * @param params 생산실적 등록 요청 정보
	 * @param user 사용자 정보
	 * @return ResultVO
	 * @throws Exception
	 */
	@Operation(
			summary = "생산실적 등록",
			description = "생산실적을 등록한다",
			security = {@SecurityRequirement(name = "Authorization")},
			tags = {"EgovProductionResultApiController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "등록 성공"),
			@ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
	})
	@PostMapping
	public ResultVO insertProductionPlan(
			@RequestBody Map<String, Object> params,
			@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {




		Map<String, Object> resultMap = new HashMap<>();
		resultMap.put("message", "생산실적이 등록되었습니다.");
		resultMap.put("user", user);

		return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
	}


}
