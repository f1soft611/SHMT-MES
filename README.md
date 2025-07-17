# SHMT-MES (Smart Manufacturing Execution System)

## 프로젝트 개요

SHMT-MES는 스마트 제조실행시스템으로, ERP 시스템과 연동하여 생산지시를 관리하고 생산실적을 수집하는 웹 애플리케이션입니다.

## 시스템 구성

- **Backend**: Java Spring Boot (97.2%)
- **Frontend**: React TypeScript (2.3%)
- **Database**: (데이터베이스 정보 필요)

## 주요 기능

### 1. 생산지시 관리

- ERP 시스템으로부터 생산지시 수신
- 생산지시 상태 관리 (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- 생산지시 목록 조회 및 상세 정보 확인

### 2. 생산실적 관리

- 생산실적 등록 및 수정
- 계획 대비 실적 추적
- 불량품 수량 관리
- ERP 시스템으로 실적 전송

### 3. 인터페이스 관리

- ERP 시스템과의 데이터 연동 모니터링
- 인바운드/아웃바운드 데이터 로그 관리
- 연동 상태 추적 (SUCCESS, FAILED, PENDING)

## 기술 스택

### Backend

- Java
- Spring Boot
- JPA/Hibernate
- RESTful API

### Frontend

- React 19.1.0
- TypeScript 4.9.5
- Material-UI (MUI) 7.2.0
- React Query (TanStack Query) 5.83.0
- React Hook Form 7.60.0
- Axios 1.10.0

## 시작하기

### 사전 요구사항

- Java 11 이상
- Node.js 16 이상
- npm 또는 yarn

### 설치 및 실행

#### 백엔드 실행

```bash
cd backend
./mvnw spring-boot:run
```

#### 프론트엔드 실행

```bash
cd frontend
npm install
npm start
```

프론트엔드는 http://localhost:3000 에서 실행되며, 백엔드 API는 http://localhost:8080 에서 실행됩니다.

### 개발 환경 설정

프론트엔드는 `package.json`에 프록시 설정이 되어 있어 백엔드 API에 직접 연결됩니다.

## API 엔드포인트

### 생산지시 API

- `GET /api/production-orders` - 생산지시 목록 조회
- `GET /api/production-orders/{id}` - 생산지시 상세 조회
- `PATCH /api/production-orders/{id}/status` - 생산지시 상태 업데이트
- `POST /api/production-orders/sync` - ERP 동기화

### 생산실적 API

- `GET /api/production-results` - 생산실적 목록 조회
- `POST /api/production-results` - 생산실적 등록
- `PUT /api/production-results/{id}` - 생산실적 수정
- `DELETE /api/production-results/{id}` - 생산실적 삭제
- `POST /api/production-results/{id}/send-to-erp` - ERP 전송

## 데이터 모델

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

## 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`)
5. Pull Request를 생성합니다

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 문의사항

프로젝트에 대한 문의사항이 있으시면 이슈를 생성하거나 담당자에게 연락해주세요.
