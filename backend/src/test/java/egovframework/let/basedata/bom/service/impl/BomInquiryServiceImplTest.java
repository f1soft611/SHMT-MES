package egovframework.let.basedata.bom.service.impl;

import egovframework.let.basedata.bom.domain.model.BomTreeNode;
import egovframework.let.basedata.bom.domain.model.BomTreeRow;
import egovframework.let.basedata.bom.domain.repository.BomInquiryDAO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BomInquiryServiceImplTest {

    @Mock
    private BomInquiryDAO bomInquiryDAO;

    private BomInquiryServiceImpl service;

    private BomTreeRow row(
            int itemSeq, int procSeq, int serl, int matItemSeq, String matName,
            BigDecimal numerator, BigDecimal denominator) {
        BomTreeRow row = new BomTreeRow();
        row.setItemSeq(itemSeq);
        row.setProcSeq(procSeq);
        row.setSerl(serl);
        row.setMatItemSeq(matItemSeq);
        row.setMatItemNo("MAT-" + matItemSeq);
        row.setMatItemName(matName);
        row.setMatItemSpec("SPEC-" + matItemSeq);
        row.setNeedQtyNumerator(numerator);
        row.setNeedQtyDenominator(denominator);
        row.setUnitName("EA");
        return row;
    }

    @Test
    @DisplayName("품목-공정-자재 평면 행을 품목>공정>자재 3단계 트리로 조립한다")
    void getBomTree_buildsThreeLevelTree() throws Exception {
        service = new BomInquiryServiceImpl(bomInquiryDAO);
        List<BomTreeRow> rows = Arrays.asList(
                row(100, 10, 1, 200, "부품A", BigDecimal.valueOf(2), BigDecimal.valueOf(1)));
        when(bomInquiryDAO.selectBomTreeRows(100)).thenReturn(rows);

        List<BomTreeNode> tree = service.getBomTree(100);

        assertThat(tree).hasSize(1);
        BomTreeNode processNode = tree.get(0);
        assertThat(processNode.getNodeType()).isEqualTo("PROCESS");
        assertThat(processNode.getProcSeq()).isEqualTo(10);
        assertThat(processNode.getChildren()).hasSize(1);

        BomTreeNode materialNode = processNode.getChildren().get(0);
        assertThat(materialNode.getNodeType()).isEqualTo("MATERIAL");
        assertThat(materialNode.getItemSeq()).isEqualTo(200);
        assertThat(materialNode.getLabel()).isEqualTo("부품A");
        assertThat(materialNode.getNeedQty()).isEqualByComparingTo("2");
        assertThat(materialNode.getChildren()).isEmpty();
    }

    @Test
    @DisplayName("자재가 반제품(하위 BOM 보유)이면 다단계로 재귀 확장한다")
    void getBomTree_expandsMultiLevelForSubAssembly() throws Exception {
        service = new BomInquiryServiceImpl(bomInquiryDAO);
        List<BomTreeRow> rows = Arrays.asList(
                row(100, 10, 1, 200, "반제품B", BigDecimal.valueOf(1), BigDecimal.valueOf(1)),
                row(200, 20, 1, 300, "원자재C", BigDecimal.valueOf(3), BigDecimal.valueOf(1)));
        when(bomInquiryDAO.selectBomTreeRows(100)).thenReturn(rows);

        List<BomTreeNode> tree = service.getBomTree(100);

        BomTreeNode level1Material = tree.get(0).getChildren().get(0);
        assertThat(level1Material.getItemSeq()).isEqualTo(200);
        assertThat(level1Material.getChildren()).hasSize(1);

        BomTreeNode level2Process = level1Material.getChildren().get(0);
        assertThat(level2Process.getNodeType()).isEqualTo("PROCESS");
        BomTreeNode level2Material = level2Process.getChildren().get(0);
        assertThat(level2Material.getItemSeq()).isEqualTo(300);
        assertThat(level2Material.getLabel()).isEqualTo("원자재C");
    }

    @Test
    @DisplayName("자재가 조상 품목을 순환 참조해도 무한 재귀 없이 리프로 처리한다")
    void getBomTree_stopsOnCircularReference() throws Exception {
        service = new BomInquiryServiceImpl(bomInquiryDAO);
        List<BomTreeRow> rows = Arrays.asList(
                row(100, 10, 1, 200, "부품A", BigDecimal.valueOf(1), BigDecimal.valueOf(1)),
                row(200, 20, 1, 100, "순환참조품목", BigDecimal.valueOf(1), BigDecimal.valueOf(1)));
        when(bomInquiryDAO.selectBomTreeRows(100)).thenReturn(rows);

        List<BomTreeNode> tree = service.getBomTree(100);

        BomTreeNode level1Material = tree.get(0).getChildren().get(0);
        BomTreeNode level2Process = level1Material.getChildren().get(0);
        BomTreeNode level2Material = level2Process.getChildren().get(0);
        assertThat(level2Material.getItemSeq()).isEqualTo(100);
        assertThat(level2Material.getChildren()).isEmpty();
    }

    @Test
    @DisplayName("소요량 분모가 0이거나 null이면 소요량을 null로 처리한다")
    void calcNeedQty_returnsNullForInvalidDenominator() {
        assertThat(BomInquiryServiceImpl.calcNeedQty(BigDecimal.TEN, BigDecimal.ZERO)).isNull();
        assertThat(BomInquiryServiceImpl.calcNeedQty(null, BigDecimal.ONE)).isNull();
        assertThat(BomInquiryServiceImpl.calcNeedQty(BigDecimal.TEN, null)).isNull();
    }
}
