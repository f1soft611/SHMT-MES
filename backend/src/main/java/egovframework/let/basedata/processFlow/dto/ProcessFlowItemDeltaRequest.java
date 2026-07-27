package egovframework.let.basedata.processFlow.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ProcessFlowItemDeltaRequest {

    private List<String> addItemIds = new ArrayList<>();
    private List<String> deleteFlowItemIds = new ArrayList<>();
}
