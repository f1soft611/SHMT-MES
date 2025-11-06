package egovframework.com.config;

import org.apache.commons.dbcp2.BasicDataSource;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;

import javax.annotation.PostConstruct;
import javax.sql.DataSource;

/**
 * @ClassName : EgovConfigAppErpDatasource.java
 * @Description : ERP DataSource 설정
 *
 * @author : SHMT-MES
 * @since  : 2025.11.06
 * @version : 1.0
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일              수정자               수정내용
 *  -------------  ------------   ---------------------
 *   2025.11.06    SHMT-MES               최초 생성
 * </pre>
 *
 */
@Configuration
@MapperScan(basePackages = "egovframework.let.scheduler.domain.repository", sqlSessionFactoryRef = "erpSqlSessionFactory")
public class EgovConfigAppErpDatasource {

	@Autowired
	Environment env;

	private String className;
	private String url;
	private String userName;
	private String password;

	@PostConstruct
	void init() {
		// ERP 전용 데이터소스 설정을 읽어옵니다
		className = env.getProperty("Globals.erp.DriverClassName");
		url = env.getProperty("Globals.erp.Url");
		userName = env.getProperty("Globals.erp.UserName");
		password = env.getProperty("Globals.erp.Password");
	}

	/**
	 * @return [ERP DataSource 설정]
	 */
	@Bean(name = "erpDataSource")
	public DataSource erpDataSource() {
		BasicDataSource basicDataSource = new BasicDataSource();
		basicDataSource.setDriverClassName(className);
		basicDataSource.setUrl(url);
		basicDataSource.setUsername(userName);
		basicDataSource.setPassword(password);
		return basicDataSource;
	}

	/**
	 * @return [ERP SqlSessionFactory 설정]
	 */
	@Bean(name = "erpSqlSessionFactory")
	public SqlSessionFactory erpSqlSessionFactory(@Qualifier("erpDataSource") DataSource dataSource) throws Exception {
		SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
		sessionFactory.setDataSource(dataSource);
		
		PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
		sessionFactory.setMapperLocations(
			resolver.getResources("classpath:/egovframework/mapper/let/scheduler/ErpUserInterface_SQL_mssql.xml")
		);
		
		return sessionFactory.getObject();
	}

	/**
	 * @return [ERP SqlSessionTemplate 설정]
	 */
	@Bean(name = "erpSqlSessionTemplate")
	public SqlSessionTemplate erpSqlSessionTemplate(@Qualifier("erpSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
		return new SqlSessionTemplate(sqlSessionFactory);
	}

	/**
	 * @return [ERP TransactionManager 설정]
	 */
	@Bean(name = "erpTransactionManager")
	public DataSourceTransactionManager erpTransactionManager(@Qualifier("erpDataSource") DataSource dataSource) {
		return new DataSourceTransactionManager(dataSource);
	}
}
