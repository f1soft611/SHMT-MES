# SHMT-MES (Smart Manufacturing Execution System)

## 프로젝트 개요

SHMT-MES는 스마트 제조실행시스템으로, ERP 시스템과 연동하여 생산지시를 관리하고 생산실적을 수집하는 웹 애플리케이션입니다.

## 시스템 구성

- **프론트엔드**: React (TypeScript 기반)
- **백엔드**: Spring Boot (Java 기반)
- **데이터베이스**: 별도 명시 필요

## 주요 기능

### 생산지시 관리

- ERP 시스템으로부터 생산지시 수신
- 생산지시 상태 관리 (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- 생산지시 목록 및 상세 조회

### 생산실적 관리

- 생산실적 등록 및 수정
- 계획 대비 실적 추적, 불량품 수량 관리
- ERP 시스템으로 실적 전송

### 인터페이스 관리

- ERP 시스템과의 데이터 연동 모니터링
- 인바운드/아웃바운드 데이터 로그 관리
- 연동 상태 추적 (SUCCESS, FAILED, PENDING)

## 기술 스택

### 프론트엔드

- React 19.1.0
- TypeScript 4.9.5
- Material-UI (MUI) 7.2.0
- React Query (TanStack Query) 5.83.0
- React Hook Form 7.60.0
- Axios 1.10.0

### 백엔드

- Java 11 이상
- Spring Boot
- JPA/Hibernate
- RESTful API

## 설치 및 실행

### 사전 요구사항

- Java 11 이상
- Node.js 16 이상
- npm 또는 yarn

### 백엔드 실행

```bash
cd backend
./mvnw spring-boot:run
```
- 기본 포트: 8080 (설정 변경은 `/src/main/resources/application.properties`의 `server.port`에서 가능)

### 프론트엔드 실행

```bash
cd frontend
npm install
npm start
```
- 기본 포트: 3000  
- 프론트엔드에서 백엔드 API는 프록시 설정으로 직접 연결됨

## API 엔드포인트 예시

- 생산지시:  
  - `GET /api/production-orders`  
  - `GET /api/production-orders/{id}`  
  - `PATCH /api/production-orders/{id}/status`  
  - `POST /api/production-orders/sync`
- 생산실적:  
  - `GET /api/production-results`  
  - `POST /api/production-results`  
  - `PUT /api/production-results/{id}`  
  - `DELETE /api/production-results/{id}`  
  - `POST /api/production-results/{id}/send-to-erp`

## 데이터 모델 예시

### 생산지시 (ProductionOrder)
```typescript
{
  id: string;
  orderNumber: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}
```

### 생산실적 (ProductionResult)
```typescript
{
  id: string;
  orderId: string;
  plannedQuantity: number;
  actualQuantity: number;
  defectQuantity: number;
  goodQuantity: number;
  workStartTime: string;
  workEndTime: string;
  operator: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
}
```

## 빌드 및 배포

### 프론트엔드 빌드
```bash
cd frontend
npm run build
```

### 백엔드 빌드
```bash
cd backend
./mvnw clean package
```

## 기여 방법

1. 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`)
5. Pull Request를 생성합니다

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 문의

이슈를 생성하거나 담당자에게 연락해주세요.