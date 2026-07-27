package egovframework.let.basedata.processFlow;

import static org.assertj.core.api.Assertions.assertThat;

import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;

import egovframework.let.basedata.processFlow.domain.model.ProcessFlow;

public class ProcessFlowSqlContractTest {

    private static final Pattern RESULT_PROPERTY =
            Pattern.compile("<result\\s+property=\"([^\"]+)\"");

    @Test
    public void resultMapOnlyUsesWritableProcessFlowProperties() throws Exception {
        Path mapper = Paths.get(
                "src/main/resources/egovframework/mapper/let/basedata/processFlow/ProcessFlow_SQL_mssql.xml");
        String xml = new String(Files.readAllBytes(mapper), StandardCharsets.UTF_8);
        Set<String> writableProperties = Arrays.stream(
                        Introspector.getBeanInfo(ProcessFlow.class).getPropertyDescriptors())
                .filter(property -> property.getWriteMethod() != null)
                .map(PropertyDescriptor::getName)
                .collect(Collectors.toSet());

        Matcher matcher = RESULT_PROPERTY.matcher(xml);
        while (matcher.find()) {
            assertThat(writableProperties)
                    .as("ProcessFlow resultMap property '%s' must have a setter", matcher.group(1))
                    .contains(matcher.group(1));
        }
    }
}
