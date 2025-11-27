package egovframework.let.production.plan.domain.model;

import egovframework.com.cmm.ComDefaultVO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.commons.lang3.builder.ToStringBuilder;

/**
 * 생산의뢰 검색 조건 VO
 * @author SHMT-MES
 * @since 2025.11.27
 * @version 1.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ProductionRequestVO extends ComDefaultVO {

    /**
     *  serialVersion UID
     */
    private static final long serialVersionUID = 1L;

    @Schema(description = "회사 코드")
    private String factoryCode = "000001";

    @Schema(description = "검색 조건")
    private String searchCnd = "";

    @Schema(description = "검색 키워드")
    private String searchWrd = "";

    @Schema(description = "시작일자 (YYYYMMDD)")
    private String startDate = "";

    @Schema(description = "종료일자 (YYYYMMDD)")
    private String endDate = "";

    @Schema(description = "페이지 인덱스")
    private int pageIndex = 1;

    @Schema(description = "페이지당 게시물 수")
    private int pageUnit = 10;

    @Schema(description = "페이지 크기")
    private int pageSize = 10;

    @Schema(description = "첫 페이지 인덱스")
    private int firstIndex = 1;

    @Schema(description = "마지막 페이지 인덱스")
    private int lastIndex = 1;

    @Schema(description = "페이지당 레코드 수")
    private int recordCountPerPage = 10;

    // 검색 조건
    private String orderNo;         // 생산의뢰번호
    private String itemCode;        // 품목코드
    private String itemName;        // 품목명
    private String customerCode;    // 거래처코드
    private String customerName;    // 거래처명
    private String dateFrom;        // 시작일자 (납기일 기준)
    private String dateTo;          // 종료일자 (납기일 기준)
    private String closingFlag;     // 마감여부

    /**
     * toString 메소드를 대치한다.
     */
    public String toString(){
        return ToStringBuilder.reflectionToString(this);
    }
}
