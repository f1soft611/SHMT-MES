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
    public void selectBomItemsSearchesByCodeOrName() throws Exception {
        String xml = mapperXml();

        assertThat(xml).contains("<select id=\"BomInquiryDAO.selectBomItems\"");
        assertThat(xml).contains("FROM TCO403");
        assertThat(xml).contains("MATERIAL_CODE LIKE '%' + #{searchWrd} + '%'");
        assertThat(xml).contains("MATERIAL_NAME LIKE '%' + #{searchWrd} + '%'");
    }

    @Test
    public void selectBomTreeRowsWalksMatItemSeqRecursivelyWithSiblingOrder() throws Exception {
        String xml = mapperXml();

        assertThat(xml).contains("<select id=\"BomInquiryDAO.selectBomTreeRows\"");
        assertThat(xml).contains("WITH BOM_SOURCE AS");
        assertThat(xml).contains("PARTITION BY T.COMPANY_SEQ, T.ITEM_SEQ");
        assertThat(xml).contains("ON C.COMPANY_SEQ = B.COMPANY_SEQ");
        assertThat(xml).contains("AND C.ITEM_SEQ = B.MAT_ITEM_SEQ");
        assertThat(xml).contains("WHERE B.VISITED_PATH NOT LIKE");
        assertThat(xml).contains("OPTION (MAXRECURSION 0)");
    }
}
