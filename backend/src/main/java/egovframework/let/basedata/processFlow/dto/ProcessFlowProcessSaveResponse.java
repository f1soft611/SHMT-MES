package egovframework.let.basedata.processFlow.dto;

import egovframework.let.basedata.processFlow.domain.model.ProcessFlowProcess;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ProcessFlowProcessSaveResponse {

    private final List<ProcessFlowProcess> processes;
}
