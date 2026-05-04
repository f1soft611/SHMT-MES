package egovframework.let.production.wipInventory.domain.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class WipInventorySearchDto implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 기준일     */
    private String searchDate;

    /** 공정     */
    private String workCode;

    /** 통합검색     */
    private String searchKeyword;

    /** 페이지 offset     */
    private int offset = 0;

    /** 페이지 size     */
    private int size = 1000;
}