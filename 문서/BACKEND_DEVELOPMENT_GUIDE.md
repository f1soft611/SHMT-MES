# 백엔드 개발 가이드 (Backend Development Guide)

## 목차
- [프로젝트 개요](#프로젝트-개요)
- [개발 환경 설정](#개발-환경-설정)
- [아키텍처 및 패턴](#아키텍처-및-패턴)
- [코드 패턴 및 규칙](#코드-패턴-및-규칙)
- [새 기능 개발 가이드](#새-기능-개발-가이드)
- [데이터베이스 작업](#데이터베이스-작업)
- [보안 및 인증](#보안-및-인증)
- [테스트 작성](#테스트-작성)
- [트러블슈팅](#트러블슈팅)

---

## 프로젝트 개요

### 기술 스택
- **Framework**: Spring Boot 2.x + eGovFramework
- **Language**: Java 1.8+
- **Build Tool**: Maven 3.8.4
- **Database**: MySQL, Oracle, MS SQL Server, Cubrid, Altibase, Tibero (다중 DB 지원)
- **ORM**: MyBatis
- **Authentication**: JWT (JSON Web Token)
- **API Documentation**: Swagger 3.x

### 프로젝트 구조
```
backend/
├── src/
│   ├── main/
│   │   ├── java/egovframework/
│   │   │   ├── com/                    # 공통 모듈
│   │   │   │   ├── cmm/                # 공통 컴포넌트
│   │   │   │   ├── jwt/                # JWT 인증
│   │   │   │   ├── config/             # 설정 클래스
│   │   │   │   └── security/           # 보안 설정
│   │   │   └── let/                    # 비즈니스 로직
│   │   │       ├── basedata/           # 기준정보 관리
│   │   │       ├── production/         # 생산 관리
│   │   │       ├── scheduler/          # 스케줄러
│   │   │       ├── interfacelog/       # 인터페이스 로그
│   │   │       └── uat/                # 사용자 인증
│   │   └── resources/
│   │       ├── application.properties   # 설정 파일
│   │       ├── egovframework/
│   │       │   └── mapper/             # MyBatis 매퍼 XML
│   │       └── db/                     # DB 설정
│   └── test/                           # 테스트 코드
├── DATABASE/                           # DDL/DML 스크립트
├── Docs/                               # 기술 문서
└── pom.xml                             # Maven 의존성 관리
```

---

## 개발 환경 설정

### 1. 필수 소프트웨어 설치
```bash
# JDK 1.8 이상 설치 확인
java -version

# Maven 3.8.4 설치 확인
mvn -version
```

### 2. 프로젝트 클론 및 빌드
```bash
# 저장소 클론
git clone [repository-url]
cd SHMT-MES/backend

# 의존성 다운로드 및 빌드
mvn clean install

# 테스트 스킵하고 빌드
mvn clean install -DskipTests
```

### 3. 데이터베이스 설정
```properties
# src/main/resources/application-dev.properties
spring.datasource.url=jdbc:mysql://localhost:3306/mes_db?useUnicode=true&characterEncoding=utf8
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# MyBatis 설정
mybatis.type-aliases-package=egovframework.let
mybatis.mapper-locations=classpath:egovframework/mapper/**/*_SQL_mysql.xml
```

### 4. 애플리케이션 실행
```bash
# CLI에서 실행
mvn spring-boot:run

# 특정 프로파일로 실행
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# IDE에서 실행
# Run As > Spring Boot App
```

### 5. Swagger 접속
- URL: `http://localhost:8080/swagger-ui/index.html`
- 인증이 필요한 API는 먼저 `/auth/login-jwt`로 토큰 발급 후 사용

---

## 아키텍처 및 패턴

### 레이어 아키텍처
```
[Controller Layer]  ← REST API 엔드포인트
        ↓
[Service Layer]     ← 비즈니스 로직
        ↓
[DAO Layer]         ← 데이터 접근
        ↓
[MyBatis Mapper]    ← SQL 쿼리
        ↓
[Database]
```

### 패키지 구조 규칙
```java
egovframework.let.[domain]/
├── controller/              # REST API 컨트롤러
├── service/                 # 서비스 인터페이스 및 구현체
│   └── impl/                # 서비스 구현체
├── domain/                  # 도메인 모델
│   ├── model/               # VO (Value Object)
│   └── repository/          # DAO (Data Access Object)
└── dto/                     # DTO (Data Transfer Object)
    ├── request/             # 요청 DTO
    └── response/            # 응답 DTO
```

### 명명 규칙

#### 클래스 명명
- **Controller**: `Egov[Domain]ApiController.java`
  - 예: `EgovProductionOrderApiController.java`
- **Service Interface**: `Egov[Domain]Service.java`
  - 예: `EgovProductionOrderService.java`
- **Service Impl**: `Egov[Domain]ServiceImpl.java`
  - 예: `EgovProductionOrderServiceImpl.java`
- **DAO**: `[Domain]DAO.java`
  - 예: `ProductionOrderDAO.java`
- **VO**: `[Domain]VO.java`
  - 예: `ProductionOrderVO.java`
- **Entity**: `[Domain].java`
  - 예: `ProductionOrder.java`

#### 메서드 명명
```java
// CRUD 메서드
public List<ProductionOrderVO> selectProductionOrderList();  // 조회 (목록)
public ProductionOrderVO selectProductionOrder(String id);    // 조회 (단건)
public void insertProductionOrder(ProductionOrderVO vo);     // 등록
public void updateProductionOrder(ProductionOrderVO vo);     // 수정
public void deleteProductionOrder(String id);                // 삭제
```

---

## 코드 패턴 및 규칙

### 1. Controller 작성 패턴

```java
package egovframework.let.production.order.controller;

import egovframework.com.cmm.LoginVO;
import egovframework.com.cmm.ResponseCode;
import egovframework.com.cmm.service.ResultVO;
import egovframework.com.cmm.util.ResultVoHelper;
import egovframework.let.production.order.domain.model.ProductionOrderVO;
import egovframework.let.production.order.service.EgovProductionOrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 생산 지시를 관리하기 위한 컨트롤러 클래스
 * @author 작성자명
 * @since 2025.01.01
 * @version 1.0
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2025.01.01 작성자          최초 생성
 * </pre>
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Tag(name = "EgovProductionOrderApiController", description = "생산 지시 관리")
public class EgovProductionOrderApiController {

    private final EgovProductionOrderService productionOrderService;
    private final ResultVoHelper resultVoHelper;

    /**
     * 생산 지시 목록을 조회한다.
     *
     * @param searchVO 검색 조건
     * @param user 로그인 사용자 정보
     * @return ResultVO 조회 결과
     */
    @Operation(
        summary = "생산 지시 목록 조회",
        description = "생산 지시 목록을 조회합니다.",
        security = {@SecurityRequirement(name = "Authorization")},
        tags = {"EgovProductionOrderApiController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    @GetMapping("/production-orders")
    public ResultVO selectProductionOrderList(
            @ModelAttribute ProductionOrderVO searchVO,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) 
            throws Exception {
        
        Map<String, Object> resultMap = productionOrderService.selectProductionOrderList(searchVO);
        
        return resultVoHelper.createResultVO(ResponseCode.SUCCESS, resultMap);
    }

    /**
     * 생산 지시를 등록한다.
     *
     * @param vo 생산 지시 정보
     * @param user 로그인 사용자 정보
     * @return ResultVO 등록 결과
     */
    @Operation(
        summary = "생산 지시 등록",
        description = "새로운 생산 지시를 등록합니다.",
        security = {@SecurityRequirement(name = "Authorization")}
    )
    @PostMapping("/production-orders")
    public ResultVO insertProductionOrder(
            @RequestBody ProductionOrderVO vo,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) 
            throws Exception {
        
        vo.setCreatedBy(user.getUniqId());
        productionOrderService.insertProductionOrder(vo);
        
        return resultVoHelper.createResultVO(ResponseCode.SUCCESS);
    }

    /**
     * 생산 지시를 수정한다.
     *
     * @param id 생산 지시 ID
     * @param vo 생산 지시 정보
     * @param user 로그인 사용자 정보
     * @return ResultVO 수정 결과
     */
    @Operation(
        summary = "생산 지시 수정",
        description = "기존 생산 지시를 수정합니다.",
        security = {@SecurityRequirement(name = "Authorization")}
    )
    @PutMapping("/production-orders/{id}")
    public ResultVO updateProductionOrder(
            @PathVariable String id,
            @RequestBody ProductionOrderVO vo,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) 
            throws Exception {
        
        vo.setId(id);
        vo.setUpdatedBy(user.getUniqId());
        productionOrderService.updateProductionOrder(vo);
        
        return resultVoHelper.createResultVO(ResponseCode.SUCCESS);
    }

    /**
     * 생산 지시를 삭제한다.
     *
     * @param id 생산 지시 ID
     * @param user 로그인 사용자 정보
     * @return ResultVO 삭제 결과
     */
    @Operation(
        summary = "생산 지시 삭제",
        description = "생산 지시를 삭제합니다.",
        security = {@SecurityRequirement(name = "Authorization")}
    )
    @DeleteMapping("/production-orders/{id}")
    public ResultVO deleteProductionOrder(
            @PathVariable String id,
            @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) 
            throws Exception {
        
        productionOrderService.deleteProductionOrder(id);
        
        return resultVoHelper.createResultVO(ResponseCode.SUCCESS);
    }
}
```

### 2. Service 작성 패턴

#### Service Interface
```java
package egovframework.let.production.order.service;

import egovframework.let.production.order.domain.model.ProductionOrderVO;
import java.util.Map;

/**
 * 생산 지시를 관리하기 위한 서비스 인터페이스
 * @author 작성자명
 * @since 2025.01.01
 */
public interface EgovProductionOrderService {

    /**
     * 생산 지시 목록을 조회한다.
     * @param searchVO 검색 조건
     * @return 조회 결과 (목록, 총 개수)
     */
    Map<String, Object> selectProductionOrderList(ProductionOrderVO searchVO) throws Exception;

    /**
     * 생산 지시를 등록한다.
     * @param vo 생산 지시 정보
     */
    void insertProductionOrder(ProductionOrderVO vo) throws Exception;

    /**
     * 생산 지시를 수정한다.
     * @param vo 생산 지시 정보
     */
    void updateProductionOrder(ProductionOrderVO vo) throws Exception;

    /**
     * 생산 지시를 삭제한다.
     * @param id 생산 지시 ID
     */
    void deleteProductionOrder(String id) throws Exception;
}
```

#### Service Implementation
```java
package egovframework.let.production.order.service.impl;

import egovframework.let.production.order.domain.model.ProductionOrderVO;
import egovframework.let.production.order.domain.repository.ProductionOrderDAO;
import egovframework.let.production.order.service.EgovProductionOrderService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 생산 지시 서비스 구현체
 * @author 작성자명
 * @since 2025.01.01
 */
@Service
@RequiredArgsConstructor
public class EgovProductionOrderServiceImpl implements EgovProductionOrderService {

    private final ProductionOrderDAO productionOrderDAO;

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> selectProductionOrderList(ProductionOrderVO searchVO) throws Exception {
        List<ProductionOrderVO> list = productionOrderDAO.selectProductionOrderList(searchVO);
        int totalCount = productionOrderDAO.selectProductionOrderListCnt(searchVO);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultList", list);
        resultMap.put("resultCnt", String.valueOf(totalCount));

        return resultMap;
    }

    @Override
    @Transactional
    public void insertProductionOrder(ProductionOrderVO vo) throws Exception {
        productionOrderDAO.insertProductionOrder(vo);
    }

    @Override
    @Transactional
    public void updateProductionOrder(ProductionOrderVO vo) throws Exception {
        productionOrderDAO.updateProductionOrder(vo);
    }

    @Override
    @Transactional
    public void deleteProductionOrder(String id) throws Exception {
        productionOrderDAO.deleteProductionOrder(id);
    }
}
```

### 3. DAO 작성 패턴

```java
package egovframework.let.production.order.domain.repository;

import egovframework.let.production.order.domain.model.ProductionOrderVO;
import org.egovframe.rte.psl.dataaccess.mapper.Mapper;

import java.util.List;

/**
 * 생산 지시 DAO
 * @author 작성자명
 * @since 2025.01.01
 */
@Mapper("productionOrderDAO")
public interface ProductionOrderDAO {

    /**
     * 생산 지시 목록을 조회한다.
     * @param searchVO 검색 조건
     * @return 생산 지시 목록
     */
    List<ProductionOrderVO> selectProductionOrderList(ProductionOrderVO searchVO);

    /**
     * 생산 지시 총 개수를 조회한다.
     * @param searchVO 검색 조건
     * @return 총 개수
     */
    int selectProductionOrderListCnt(ProductionOrderVO searchVO);

    /**
     * 생산 지시를 등록한다.
     * @param vo 생산 지시 정보
     */
    void insertProductionOrder(ProductionOrderVO vo);

    /**
     * 생산 지시를 수정한다.
     * @param vo 생산 지시 정보
     */
    void updateProductionOrder(ProductionOrderVO vo);

    /**
     * 생산 지시를 삭제한다.
     * @param id 생산 지시 ID
     */
    void deleteProductionOrder(String id);
}
```

### 4. VO (Value Object) 작성 패턴

```java
package egovframework.let.production.order.domain.model;

import egovframework.com.cmm.ComDefaultVO;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;
import java.util.Date;

/**
 * 생산 지시 VO
 * @author 작성자명
 * @since 2025.01.01
 */
@Getter
@Setter
@ToString
public class ProductionOrderVO extends ComDefaultVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 생산 지시 ID */
    private String id;

    /** 생산 지시 번호 */
    private String orderNo;

    /** 품목 ID */
    private String itemId;

    /** 품목명 */
    private String itemName;

    /** 지시 수량 */
    private Integer orderQuantity;

    /** 예정 일자 */
    private Date scheduledDate;

    /** 상태 (PENDING, IN_PROGRESS, COMPLETED) */
    private String status;

    /** 작업장 ID */
    private String workplaceId;

    /** 작업장명 */
    private String workplaceName;

    /** 비고 */
    private String remark;

    /** 생성자 ID */
    private String createdBy;

    /** 생성 일시 */
    private Date createdAt;

    /** 수정자 ID */
    private String updatedBy;

    /** 수정 일시 */
    private Date updatedAt;

    /** 삭제 여부 (Y/N) */
    private String useYn;
}
```

### 5. MyBatis Mapper XML 작성 패턴

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="egovframework.let.production.order.domain.repository.ProductionOrderDAO">

    <!-- Result Map -->
    <resultMap id="productionOrder" type="egovframework.let.production.order.domain.model.ProductionOrderVO">
        <result property="id" column="ID"/>
        <result property="orderNo" column="ORDER_NO"/>
        <result property="itemId" column="ITEM_ID"/>
        <result property="itemName" column="ITEM_NAME"/>
        <result property="orderQuantity" column="ORDER_QUANTITY"/>
        <result property="scheduledDate" column="SCHEDULED_DATE"/>
        <result property="status" column="STATUS"/>
        <result property="workplaceId" column="WORKPLACE_ID"/>
        <result property="workplaceName" column="WORKPLACE_NAME"/>
        <result property="remark" column="REMARK"/>
        <result property="createdBy" column="CREATED_BY"/>
        <result property="createdAt" column="CREATED_AT"/>
        <result property="updatedBy" column="UPDATED_BY"/>
        <result property="updatedAt" column="UPDATED_AT"/>
        <result property="useYn" column="USE_YN"/>
    </resultMap>

    <!-- 공통 조건 SQL -->
    <sql id="searchCondition">
        <if test="searchKeyword != null and searchKeyword != ''">
            AND (
                ORDER_NO LIKE CONCAT('%', #{searchKeyword}, '%')
                OR ITEM_NAME LIKE CONCAT('%', #{searchKeyword}, '%')
            )
        </if>
        <if test="status != null and status != ''">
            AND STATUS = #{status}
        </if>
        <if test="startDate != null and startDate != ''">
            AND SCHEDULED_DATE &gt;= #{startDate}
        </if>
        <if test="endDate != null and endDate != ''">
            AND SCHEDULED_DATE &lt;= #{endDate}
        </if>
    </sql>

    <!-- 생산 지시 목록 조회 -->
    <select id="selectProductionOrderList" resultMap="productionOrder">
        SELECT
            po.ID,
            po.ORDER_NO,
            po.ITEM_ID,
            i.ITEM_NAME,
            po.ORDER_QUANTITY,
            po.SCHEDULED_DATE,
            po.STATUS,
            po.WORKPLACE_ID,
            w.WORKPLACE_NAME,
            po.REMARK,
            po.CREATED_BY,
            po.CREATED_AT,
            po.UPDATED_BY,
            po.UPDATED_AT,
            po.USE_YN
        FROM TB_PRODUCTION_ORDER po
        LEFT JOIN TB_ITEM i ON po.ITEM_ID = i.ID
        LEFT JOIN TB_WORKPLACE w ON po.WORKPLACE_ID = w.ID
        WHERE po.USE_YN = 'Y'
        <include refid="searchCondition"/>
        ORDER BY po.SCHEDULED_DATE DESC, po.CREATED_AT DESC
        <if test="firstIndex != null and lastIndex != null">
            LIMIT #{firstIndex}, #{recordCountPerPage}
        </if>
    </select>

    <!-- 생산 지시 총 개수 조회 -->
    <select id="selectProductionOrderListCnt" resultType="int">
        SELECT COUNT(*)
        FROM TB_PRODUCTION_ORDER po
        WHERE po.USE_YN = 'Y'
        <include refid="searchCondition"/>
    </select>

    <!-- 생산 지시 등록 -->
    <insert id="insertProductionOrder">
        INSERT INTO TB_PRODUCTION_ORDER (
            ID,
            ORDER_NO,
            ITEM_ID,
            ORDER_QUANTITY,
            SCHEDULED_DATE,
            STATUS,
            WORKPLACE_ID,
            REMARK,
            CREATED_BY,
            CREATED_AT,
            USE_YN
        ) VALUES (
            #{id},
            #{orderNo},
            #{itemId},
            #{orderQuantity},
            #{scheduledDate},
            #{status},
            #{workplaceId},
            #{remark},
            #{createdBy},
            NOW(),
            'Y'
        )
    </insert>

    <!-- 생산 지시 수정 -->
    <update id="updateProductionOrder">
        UPDATE TB_PRODUCTION_ORDER
        SET
            ITEM_ID = #{itemId},
            ORDER_QUANTITY = #{orderQuantity},
            SCHEDULED_DATE = #{scheduledDate},
            STATUS = #{status},
            WORKPLACE_ID = #{workplaceId},
            REMARK = #{remark},
            UPDATED_BY = #{updatedBy},
            UPDATED_AT = NOW()
        WHERE ID = #{id}
    </update>

    <!-- 생산 지시 삭제 (논리적 삭제) -->
    <update id="deleteProductionOrder">
        UPDATE TB_PRODUCTION_ORDER
        SET
            USE_YN = 'N',
            UPDATED_AT = NOW()
        WHERE ID = #{id}
    </update>

</mapper>
```

---

## 새 기능 개발 가이드

### Step 1: 요구사항 분석
1. 기능 명세 확인
2. 필요한 테이블 및 컬럼 파악
3. API 엔드포인트 설계
4. 데이터 흐름 정의

### Step 2: 데이터베이스 작업
```sql
-- 1. DDL 스크립트 작성 (DATABASE/ 폴더)
-- DATABASE/[feature]_ddl_mysql.sql

CREATE TABLE TB_PRODUCTION_ORDER (
    ID VARCHAR(50) PRIMARY KEY,
    ORDER_NO VARCHAR(50) NOT NULL UNIQUE,
    ITEM_ID VARCHAR(50) NOT NULL,
    ORDER_QUANTITY INT NOT NULL,
    SCHEDULED_DATE DATE,
    STATUS VARCHAR(20) DEFAULT 'PENDING',
    WORKPLACE_ID VARCHAR(50),
    REMARK TEXT,
    CREATED_BY VARCHAR(50),
    CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY VARCHAR(50),
    UPDATED_AT DATETIME,
    USE_YN CHAR(1) DEFAULT 'Y',
    INDEX idx_order_no (ORDER_NO),
    INDEX idx_status (STATUS),
    INDEX idx_scheduled_date (SCHEDULED_DATE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Step 3: 패키지 및 클래스 생성
```
egovframework/let/[domain]/
├── controller/
│   └── Egov[Domain]ApiController.java
├── service/
│   ├── Egov[Domain]Service.java
│   └── impl/
│       └── Egov[Domain]ServiceImpl.java
├── domain/
│   ├── model/
│   │   └── [Domain]VO.java
│   └── repository/
│       └── [Domain]DAO.java
└── dto/
    ├── request/
    │   └── [Domain]RequestDTO.java
    └── response/
        └── [Domain]ResponseDTO.java
```

### Step 4: MyBatis 매퍼 작성
```
src/main/resources/egovframework/mapper/let/[domain]/
└── [Domain]_SQL_mysql.xml
```

### Step 5: 서비스 계층 구현
1. Service Interface 작성
2. Service Implementation 작성
3. 트랜잭션 처리 (@Transactional)

### Step 6: Controller 작성
1. REST API 엔드포인트 정의
2. Swagger 어노테이션 추가
3. 인증/권한 설정

### Step 7: 테스트
1. 단위 테스트 작성
2. Swagger에서 API 테스트
3. 통합 테스트

---

## 데이터베이스 작업

### 지원 데이터베이스
- MySQL
- Oracle
- MS SQL Server
- Cubrid
- Altibase
- Tibero

### MyBatis 설정
```properties
# application.properties
mybatis.type-aliases-package=egovframework.let
mybatis.mapper-locations=classpath:egovframework/mapper/**/*_SQL_mysql.xml
```

### 페이징 처리
```java
// VO에 페이징 정보 설정
searchVO.setFirstIndex(paginationInfo.getFirstRecordIndex());
searchVO.setLastIndex(paginationInfo.getLastRecordIndex());
searchVO.setRecordCountPerPage(paginationInfo.getRecordCountPerPage());

// MyBatis XML에서 LIMIT 사용
<select id="selectList">
    SELECT * FROM TABLE
    WHERE USE_YN = 'Y'
    LIMIT #{firstIndex}, #{recordCountPerPage}
</select>
```

### 트랜잭션 관리
```java
@Service
public class ServiceImpl {
    
    // 읽기 전용 트랜잭션 (성능 최적화)
    @Transactional(readOnly = true)
    public List<VO> selectList() {
        return dao.selectList();
    }
    
    // 쓰기 트랜잭션
    @Transactional
    public void insert(VO vo) {
        dao.insert(vo);
    }
    
    // 롤백 조건 지정
    @Transactional(rollbackFor = Exception.class)
    public void complexOperation() {
        dao.insert1();
        dao.insert2();
        // 예외 발생 시 모두 롤백
    }
}
```

---

## 보안 및 인증

### JWT 인증 흐름
```
1. 로그인 요청 (/auth/login-jwt)
   ↓
2. 사용자 인증 및 JWT 토큰 발급
   ↓
3. 클라이언트는 토큰을 헤더에 포함
   Authorization: Bearer [token]
   ↓
4. 서버에서 토큰 검증 및 권한 확인
   ↓
5. API 처리
```

### Controller에서 인증 사용자 정보 가져오기
```java
@GetMapping("/api/endpoint")
public ResultVO getData(
        @Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) {
    
    String userId = user.getUniqId();      // 사용자 ID
    String userName = user.getName();      // 사용자 이름
    String userType = user.getUserSe();    // 사용자 유형
    
    // 비즈니스 로직...
}
```

### 권한 설정
```java
// 특정 권한이 필요한 API
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/api/critical-data/{id}")
public ResultVO deleteCriticalData(@PathVariable String id) {
    // ADMIN 권한이 있는 사용자만 접근 가능
}
```

### 슬라이딩 윈도우 세션 방식
- 토큰 유효 시간: 60분
- 사용자 활동 시마다 자동 연장
- 비활동 60분 후 자동 로그아웃
- 리프레시 토큰: 7일 유효

---

## 테스트 작성

### 단위 테스트 예제
```java
package egovframework.let.production.order.service;

import egovframework.let.production.order.domain.model.ProductionOrderVO;
import egovframework.let.production.order.domain.repository.ProductionOrderDAO;
import egovframework.let.production.order.service.impl.EgovProductionOrderServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EgovProductionOrderServiceTest {

    @Mock
    private ProductionOrderDAO productionOrderDAO;

    @InjectMocks
    private EgovProductionOrderServiceImpl service;

    private ProductionOrderVO testVO;

    @BeforeEach
    void setUp() {
        testVO = new ProductionOrderVO();
        testVO.setId("PO001");
        testVO.setOrderNo("2025-001");
        testVO.setItemId("ITEM001");
        testVO.setOrderQuantity(100);
    }

    @Test
    void selectProductionOrderList_정상조회() throws Exception {
        // Given
        List<ProductionOrderVO> mockList = Arrays.asList(testVO);
        when(productionOrderDAO.selectProductionOrderList(any())).thenReturn(mockList);
        when(productionOrderDAO.selectProductionOrderListCnt(any())).thenReturn(1);

        // When
        Map<String, Object> result = service.selectProductionOrderList(new ProductionOrderVO());

        // Then
        assertNotNull(result);
        assertEquals(1, ((List) result.get("resultList")).size());
        assertEquals("1", result.get("resultCnt"));
        verify(productionOrderDAO, times(1)).selectProductionOrderList(any());
    }

    @Test
    void insertProductionOrder_정상등록() throws Exception {
        // Given
        doNothing().when(productionOrderDAO).insertProductionOrder(any());

        // When
        service.insertProductionOrder(testVO);

        // Then
        verify(productionOrderDAO, times(1)).insertProductionOrder(testVO);
    }
}
```

### 통합 테스트 예제
```java
@SpringBootTest
@AutoConfigureMockMvc
class ProductionOrderIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void 생산지시_전체_플로우_테스트() throws Exception {
        // 1. 로그인 및 토큰 발급
        String token = getAuthToken();

        // 2. 생산 지시 등록
        ProductionOrderVO vo = new ProductionOrderVO();
        vo.setOrderNo("2025-001");
        vo.setItemId("ITEM001");
        vo.setOrderQuantity(100);

        mockMvc.perform(post("/api/production-orders")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultCode").value(200));

        // 3. 목록 조회
        mockMvc.perform(get("/api/production-orders")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.resultList").isArray());
    }
}
```

---

## 트러블슈팅

### 자주 발생하는 문제

#### 1. MyBatis Mapper를 찾을 수 없음
**증상**: `org.apache.ibatis.binding.BindingException: Invalid bound statement`

**해결**:
```properties
# application.properties 확인
mybatis.mapper-locations=classpath:egovframework/mapper/**/*_SQL_mysql.xml

# Mapper XML의 namespace가 DAO 인터페이스와 일치하는지 확인
<mapper namespace="egovframework.let.production.order.domain.repository.ProductionOrderDAO">
```

#### 2. JWT 토큰 인증 실패
**증상**: 401 Unauthorized 또는 403 Forbidden

**해결**:
```java
// 1. 토큰이 올바르게 전달되는지 확인
Authorization: Bearer [token]

// 2. 토큰 유효기간 확인
// 3. Swagger에서 Authorize 버튼으로 토큰 설정 확인
```

#### 3. 트랜잭션이 작동하지 않음
**증상**: 데이터베이스 롤백이 안됨

**해결**:
```java
// @Transactional 어노테이션 확인
// 1. @EnableTransactionManagement가 설정되어 있는지
// 2. Service 구현체에 @Service 어노테이션이 있는지
// 3. public 메서드에만 적용되는지 확인

@Service
public class ServiceImpl {
    @Transactional  // ✅ 올바른 사용
    public void publicMethod() { }
    
    @Transactional  // ❌ private은 트랜잭션 적용 안됨
    private void privateMethod() { }
}
```

#### 4. 한글 인코딩 문제
**해결**:
```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/mes_db?useUnicode=true&characterEncoding=utf8
server.servlet.encoding.charset=UTF-8
server.servlet.encoding.enabled=true
server.servlet.encoding.force=true
```

#### 5. CORS 오류
**해결**:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 로그 레벨 조정
```properties
# application.properties
# 전체 로그 레벨
logging.level.root=INFO

# 특정 패키지 로그 레벨
logging.level.egovframework=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.mybatis=DEBUG

# SQL 로그 출력
logging.level.egovframework.let.*.domain.repository=TRACE
```

---

## 추가 리소스

### 공식 문서
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [eGovFramework](https://www.egovframe.go.kr/)
- [MyBatis Documentation](https://mybatis.org/mybatis-3/)
- [Swagger/OpenAPI](https://swagger.io/specification/)

### 관련 문서
- [프론트엔드 개발 가이드](./FRONTEND_DEVELOPMENT_GUIDE.md)
- [통합 개발 워크플로우](./DEVELOPMENT_WORKFLOW.md)
- [권한별 읽기쓰기 가이드](./권한별_읽기쓰기_가이드.md)

---

**문서 버전**: 1.0  
**최종 수정일**: 2025-01-07  
**작성자**: GitHub Copilot
