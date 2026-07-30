package egovframework.let.basedata.bom.service.impl;

import egovframework.let.basedata.bom.domain.model.BomTreeRow;
import egovframework.let.basedata.bom.domain.repository.BomInquiryDAO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BomInquiryServiceImplTest {

    @Mock
    private BomInquiryDAO bomInquiryDAO;

    @Test
    @DisplayName("getBomTree는 DAO가 조회한 평면 BOM 행을 그대로 반환한다")
    void getBomTree_returnsFlatRowsFromDao() throws Exception {
        BomInquiryServiceImpl service = new BomInquiryServiceImpl(bomInquiryDAO);
        BomTreeRow row = new BomTreeRow();
        row.setDepth("01");
        row.setItemSeq(100);
        row.setItemNo("PRD-100");
        row.setItemName("제품A");
        row.setMatItemSeq(200);
        row.setMatItemNo("MAT-200");
        row.setMatItemName("부품A");
        row.setMatItemSpec("SPEC-200");
        List<BomTreeRow> rows = Arrays.asList(row);
        when(bomInquiryDAO.selectBomTreeRows(100)).thenReturn(rows);

        List<BomTreeRow> result = service.getBomTree(100);

        assertThat(result).isEqualTo(rows);
    }
}
