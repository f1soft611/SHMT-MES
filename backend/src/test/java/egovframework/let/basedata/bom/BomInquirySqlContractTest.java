package egovframework.let.basedata.bom;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.junit.jupiter.api.Test;

public class BomInquirySqlContractTest {

    private String mapperXml() throws Exception {
        Path mapper = Paths.get(
                "src/main/resources/egovframework/mapper/let/basedata/bom/BomInquiry_SQL_mssql.xml");
        return new String(Files.readAllBytes(mapper), StandardCharsets.UTF_8);
    }

    @Test
    public void selectBomItemsSearchesByIdCodeOrName() throws Exception {
        String xml = mapperXml();

        assertThat(xml).contains("<select id=\"BomInquiryDAO.selectBomItems\"");
        assertThat(xml).contains("FROM TCO403");
        assertThat(xml).contains("MATERIAL_ID   LIKE '%' + #{keyword} + '%'");
        assertThat(xml).contains("MATERIAL_CODE LIKE '%' + #{keyword} + '%'");
        assertThat(xml).contains("MATERIAL_NAME LIKE '%' + #{keyword} + '%'");
    }

    @Test
    public void selectBomTreeRowsWalksMatItemSeqRecursivelyWithLatestRevision() throws Exception {
        String xml = mapperXml();

        assertThat(xml).contains("<select id=\"BomInquiryDAO.selectBomTreeRows\"");
        assertThat(xml).contains("WITH LATEST_REV AS");
        assertThat(xml).contains("ROW_NUMBER() OVER (PARTITION BY ITEM_SEQ ORDER BY BOM_REV DESC, PROC_REV DESC)");
        assertThat(xml).contains("ON C.ITEM_SEQ = B.MAT_ITEM_SEQ AND C.RN = 1");
        assertThat(xml).contains("WHERE B.VISITED_PATH NOT LIKE");
        assertThat(xml).contains("OPTION (MAXRECURSION 0)");
    }
}
