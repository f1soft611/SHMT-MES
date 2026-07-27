package egovframework.let.basedata.processFlow.dto;

import egovframework.let.basedata.processFlow.domain.model.ProcessFlowItem;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ProcessFlowItemDeltaResponse {

    private final List<ProcessFlowItem> addedItems;
    private final List<String> deletedFlowItemIds;
}
