package egovframework.let.basedata.processFlow.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ProcessFlowProcessSaveRequest {

    private List<Entry> processes = new ArrayList<>();

    @Getter
    @Setter
    public static class Entry {
        private String flowProcessCode;
        private Integer seq;
        private String planFlag;
        private String lastFlag;
    }
}
