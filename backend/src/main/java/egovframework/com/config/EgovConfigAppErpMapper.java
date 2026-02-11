package egovframework.com.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.*;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;

/**
 * @ClassName : EgovConfigAppErpMapper.java
 * @Description : Mapper 설정
 *
 * @author : 윤주호
 * @since  : 2021. 7. 20
 * @version : 1.0
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일              수정자               수정내용
 *  -------------  ------------   ---------------------
 *   2021. 7. 20    윤주호               최초 생성
 * </pre>
 *
 */
@Configuration
@PropertySources({
	@PropertySource("classpath:/application.properties")
})
public class EgovConfigAppErpMapper {


	@Bean(name = "erpSqlSessionFactory")
	public SqlSessionFactory erpSqlSessionFactory(
			@Qualifier("erpDataSource") DataSource erpDataSource
	) throws Exception {

		SqlSessionFactoryBean bean = new SqlSessionFactoryBean();
		bean.setDataSource(erpDataSource);

		// egov 공통 설정
		bean.setConfigLocation(
			new PathMatchingResourcePatternResolver()
					.getResource("classpath:/egovframework/mapper/config/mapper-config.xml")
		);

		// ERP 매퍼만 로딩 (중요)
		bean.setMapperLocations(
			new PathMatchingResourcePatternResolver()
					.getResources(
						"classpath:/egovframework/mapper/let/erpIf/*_SQL_mssql.xml"
					)
		);

		return bean.getObject();
	}

	@Bean(name = "erpSqlSessionTemplate")
	public SqlSessionTemplate erpSqlSessionTemplate(
			@Qualifier("erpSqlSessionFactory") SqlSessionFactory sqlSessionFactory
	) {
		return new SqlSessionTemplate(sqlSessionFactory);
	}
}
