package egovframework.let.production.performance.domain.model;

import lombok.Data;

@Data
public class ProductionPerformanceSearchDto {
    private String dateFrom;
    private String dateTo;

    private String workplace;
    private String equipment;
    private String keyword;

    // paging
    private Integer offset;
    private Integer size;
}
