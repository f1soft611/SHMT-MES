package egovframework.let.production.result;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.junit.jupiter.api.Test;

public class ProductionResultSqlContractTest {

    @Test
    public void insertErpIFProdResultTargetsWorkReportTable() throws Exception {
        Path mapper = Paths.get(
                "src/main/resources/egovframework/mapper/let/erpIf/ErpIFProdResult_SQL_mssql.xml");
        String xml = new String(Files.readAllBytes(mapper), StandardCharsets.UTF_8);

        assertThat(xml).contains("<insert id=\"insertErpIFProdResult\"");
        assertThat(xml).contains("INSERT INTO SHM_IF_TPDSFCWorkReport");
        assertThat(xml).contains("#{workingTag}");
        assertThat(xml).contains("#{mesIfKey}");
    }

    @Test
    public void selectProductionResultForErpJoinsProdOrderForLotNo() throws Exception {
        Path mapper = Paths.get(
                "src/main/resources/egovframework/mapper/let/production/result/ProductionResult_SQL_mssql.xml");
        String xml = new String(Files.readAllBytes(mapper), StandardCharsets.UTF_8);

        assertThat(xml).contains("<select id=\"selectProductionResultForErp\"");
        assertThat(xml).contains("LEFT JOIN TPR504");
        assertThat(xml).contains("AS lotNo");
        assertThat(xml).contains("AS workorderSeq");
    }

    @Test
    public void selectProdSeqUsesMaxNotCountToAvoidGapCollisions() throws Exception {
        Path mapper = Paths.get(
                "src/main/resources/egovframework/mapper/let/production/result/ProductionResult_SQL_mssql.xml");
        String xml = new String(Files.readAllBytes(mapper), StandardCharsets.UTF_8);

        assertThat(xml).contains("<select id=\"selectProdSeq\"");
        // COUNT(*)+1 collides with existing PROD_SEQ once a row is deleted, leaving a gap.
        assertThat(xml).contains("ISNULL(MAX(PROD_SEQ), 0)+1");
    }
}