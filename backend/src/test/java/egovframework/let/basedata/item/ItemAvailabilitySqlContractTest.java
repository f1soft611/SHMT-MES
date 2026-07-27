package egovframework.let.basedata.item;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.apache.commons.lang3.StringUtils;
import org.junit.Test;

public class ItemAvailabilitySqlContractTest {

    @Test
    public void listAndCountExcludeItemsOwnedByAnotherFlow() throws Exception {
        Path mapper = Paths.get(
                "src/main/resources/egovframework/mapper/let/basedata/item/Item_SQL_mssql.xml");
        String xml = new String(Files.readAllBytes(mapper), StandardCharsets.UTF_8);

        assertThat(xml).contains("availableForProcessFlowId");
        assertThat(StringUtils.countMatches(
                xml, "FI.WORK_ORDER_ID != #{availableForProcessFlowId}"))
                .isGreaterThanOrEqualTo(2);
        assertThat(StringUtils.countMatches(
                xml, "FI.FACTORY_CODE = A.FACTORY_CODE"))
                .isGreaterThanOrEqualTo(2);
    }
}
