package egovframework.let.scheduler;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.junit.jupiter.api.Test;

public class MesTPDROUItemProcMatSqlContractTest {

    private String mapperXml() throws Exception {
        Path mapper = Paths.get(
                "src/main/resources/egovframework/mapper/let/scheduler/MesTPDROUItemProcMatInterface_SQL_mssql.xml");
        return new String(Files.readAllBytes(mapper), StandardCharsets.UTF_8);
    }

    @Test
    public void selectTreeItemSeqsWalksMatItemSeqRecursively() throws Exception {
        String xml = mapperXml();

        assertThat(xml).contains("<select id=\"selectTPDROUItemProcMatTreeItemSeqs\"");
        assertThat(xml).contains("WITH BOM_TREE AS");
        assertThat(xml).contains("WHERE ITEM_SEQ = #{itemSeq}");
        assertThat(xml).contains("INNER JOIN TCO501 C ON B.MAT_ITEM_SEQ = C.ITEM_SEQ");
        assertThat(xml).contains("OPTION (MAXRECURSION 0)");
    }

    @Test
    public void deleteByItemSeqsUsesForeachInClause() throws Exception {
        String xml = mapperXml();

        assertThat(xml).contains("<delete id=\"deleteMesTPDROUItemProcMatByItemSeqs\"");
        assertThat(xml).contains("DELETE FROM TCO501");
        assertThat(xml).contains("<foreach collection=\"list\" item=\"itemSeq\" open=\"(\" separator=\",\" close=\")\">");
    }

    @Test
    public void insertAndUpdateIncludeWorkCenterSeq() throws Exception {
        String xml = mapperXml();

        assertThat(xml).contains("WORKCENTER_SEQ");
        assertThat(xml).contains("#{WorkCenterSeq}");
        assertThat(xml).contains("WORKCENTER_SEQ = #{WorkCenterSeq}");
    }
}