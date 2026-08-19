package egovframework.let.production.order;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.junit.jupiter.api.Test;

public class ProductionOrderSqlContractTest {

    @Test
    public void selectRootItemCodesByPlanFiltersByPlanKeyOnly() throws Exception {
        Path mapper = Paths.get(
                "src/main/resources/egovframework/mapper/let/production/order/ProductionOrder_SQL_mssql.xml");
        String xml = new String(Files.readAllBytes(mapper), StandardCharsets.UTF_8);

        assertThat(xml).contains("<select id=\"selectRootItemCodesByPlan\"");
        assertThat(xml).contains("SELECT DISTINCT A.ITEM_CODE");
        assertThat(xml).contains("A.PRODPLAN_DATE = #{prodplanDate}");
        assertThat(xml).contains("A.PRODPLAN_SEQ = #{prodplanSeq}");
        assertThat(xml).contains("A.PRODWORK_SEQ = #{prodworkSeq}");
    }

    @Test
    public void selectFlowProcessReturnsPlanFlag() throws Exception {
        Path mapper = Paths.get(
                "src/main/resources/egovframework/mapper/let/production/order/ProductionOrder_SQL_mssql.xml");
        String xml = new String(Files.readAllBytes(mapper), StandardCharsets.UTF_8);

        int selectStart = xml.indexOf("<select id=\"selectFlowProcess\"");
        int selectEnd = xml.indexOf("</select>", selectStart);
        String selectFlowProcess = xml.substring(selectStart, selectEnd);

        assertThat(selectFlowProcess).contains("D.PLAN_FLAG AS PLAN_FLAG");
    }

    @Test
    public void productionPlanInsertPersistsRemarkInMasterAndDetail() throws Exception {
        Path mapper = Paths.get(
                "src/main/resources/egovframework/mapper/let/production/plan/ProductionPlan_SQL_mssql.xml");
        String xml = new String(Files.readAllBytes(mapper), StandardCharsets.UTF_8);

        assertThat(xml).contains("INSERT INTO TPR301M (");
        assertThat(xml).contains("INSERT INTO TPR301 (");
        assertThat(xml).contains("BIGO,");
        assertThat(xml).contains("#{remark}");
        assertThat(xml).contains("TOTAL_GROUP_COUNT,");
    }
}