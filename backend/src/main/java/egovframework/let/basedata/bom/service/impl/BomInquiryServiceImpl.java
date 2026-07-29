package egovframework.let.basedata.bom.service.impl;

import egovframework.let.basedata.bom.domain.model.BomItemSearchRow;
import egovframework.let.basedata.bom.domain.model.BomTreeNode;
import egovframework.let.basedata.bom.domain.model.BomTreeRow;
import egovframework.let.basedata.bom.domain.repository.BomInquiryDAO;
import egovframework.let.basedata.bom.service.BomInquiryService;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service("BomInquiryService")
@RequiredArgsConstructor
public class BomInquiryServiceImpl extends EgovAbstractServiceImpl implements BomInquiryService {

    private final BomInquiryDAO bomInquiryDAO;

    @Override
    public List<BomItemSearchRow> searchItems(Map<String, Object> params) throws Exception {
        return bomInquiryDAO.selectBomItems(params);
    }

    @Override
    public List<BomTreeNode> getBomTree(int itemSeq) throws Exception {
        List<BomTreeRow> rows = bomInquiryDAO.selectBomTreeRows(itemSeq);
        Map<Integer, List<BomTreeRow>> rowsByItemSeq = rows.stream()
                .collect(Collectors.groupingBy(BomTreeRow::getItemSeq, LinkedHashMap::new, Collectors.toList()));
        return buildProcessNodes(itemSeq, rowsByItemSeq, new HashSet<>());
    }

    /**
     * itemSeq가 이미 조상 경로(ancestors)에 있으면 순환 참조로 보고 리프로 처리한다.
     */
    static List<BomTreeNode> buildProcessNodes(
            int itemSeq, Map<Integer, List<BomTreeRow>> rowsByItemSeq, Set<Integer> ancestors) {

        if (ancestors.contains(itemSeq)) {
            return Collections.emptyList();
        }
        List<BomTreeRow> rows = rowsByItemSeq.get(itemSeq);
        if (rows == null || rows.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Integer> nextAncestors = new HashSet<>(ancestors);
        nextAncestors.add(itemSeq);

        Map<Integer, List<BomTreeRow>> rowsByProcSeq = rows.stream()
                .collect(Collectors.groupingBy(BomTreeRow::getProcSeq, LinkedHashMap::new, Collectors.toList()));

        List<BomTreeNode> processNodes = new ArrayList<>();
        for (Map.Entry<Integer, List<BomTreeRow>> entry : rowsByProcSeq.entrySet()) {
            int procSeq = entry.getKey();
            BomTreeNode processNode = new BomTreeNode();
            processNode.setKey(itemSeq + "-P" + procSeq);
            processNode.setNodeType("PROCESS");
            processNode.setItemSeq(itemSeq);
            processNode.setProcSeq(procSeq);
            processNode.setLabel("공정 " + procSeq);
            processNode.setChildren(buildMaterialNodes(itemSeq, entry.getValue(), rowsByItemSeq, nextAncestors));
            processNodes.add(processNode);
        }
        return processNodes;
    }

    static List<BomTreeNode> buildMaterialNodes(
            int parentItemSeq, List<BomTreeRow> rows,
            Map<Integer, List<BomTreeRow>> rowsByItemSeq, Set<Integer> ancestors) {

        List<BomTreeNode> materialNodes = new ArrayList<>();
        for (BomTreeRow row : rows) {
            BomTreeNode materialNode = new BomTreeNode();
            materialNode.setKey(parentItemSeq + "-P" + row.getProcSeq() + "-M" + row.getMatItemSeq() + "-" + row.getSerl());
            materialNode.setNodeType("MATERIAL");
            materialNode.setItemSeq(row.getMatItemSeq());
            materialNode.setProcSeq(row.getProcSeq());
            materialNode.setLabel(row.getMatItemName());
            materialNode.setItemNo(row.getMatItemNo());
            materialNode.setItemSpec(row.getMatItemSpec());
            materialNode.setNeedQty(calcNeedQty(row.getNeedQtyNumerator(), row.getNeedQtyDenominator()));
            materialNode.setUnitName(row.getUnitName());
            materialNode.setChildren(buildProcessNodes(row.getMatItemSeq(), rowsByItemSeq, ancestors));
            materialNodes.add(materialNode);
        }
        return materialNodes;
    }

    static BigDecimal calcNeedQty(BigDecimal numerator, BigDecimal denominator) {
        if (numerator == null || denominator == null || denominator.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return numerator.divide(denominator, 5, RoundingMode.HALF_UP);
    }
}
