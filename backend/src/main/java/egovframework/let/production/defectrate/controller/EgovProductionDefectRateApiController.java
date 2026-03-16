package egovframework.let.production.defectrate.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.let.common.dto.ListResult;
import egovframework.let.production.defectrate.domain.model.ProductionDefectRateRow;
import egovframework.let.production.defectrate.domain.model.ProductionDefectRateSearchDto;
import egovframework.let.production.defectrate.service.EgovProductionDefectRateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.property.EgovPropertyService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/prod/defect-rate")
@Tag(name="EgovProductionDefectRateApiController", description = "불량율 현황")
public class EgovProductionDefectRateApiController {

	private final ResultVoHelper resultVoHelper;
	private final EgovProductionDefectRateService egovProductionDefectRateService;
	private final EgovPropertyService propertyService;

	/**
	 * 불량율] 불량율 목록을 조회한다.
	 *
	 * @param searchVO 검색 조건
	 * @param user 사용자 정보
	 * @return ResultVO
	 * @throws Exception
	 */
	@Operation(
			summary = "불량율] 불량율 목록 조회",
			description = "불량율] 불량율 목록 조회",
			security = {@SecurityRequirement(name = "Authorization")},
			tags = {"EgovProductionPerformanceApiController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "403", description = "인가된 사용자가 아님")
	})
	@GetMapping
	public ResultVO selectProductionDefectRateList(
			@ModelAttribute ProductionDefectRateSearchDto searchVO,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {

		searchVO.setOffset(page * size);
		searchVO.setSize(size);

		ListResult<ProductionDefectRateRow> data = egovProductionDefectRateService.selectProdDefectRateList(searchVO);

		Map<String, Object> resultMap = new HashMap<>();
		resultMap.put("resultList", data.getResultList());
		resultMap.put("resultCnt", data.getResultCnt());
		resultMap.put("user", user);
		return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
	}
}
