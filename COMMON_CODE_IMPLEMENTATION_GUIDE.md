# Common Code Management and Process/Workplace Updates Implementation Guide

## Overview
This document provides a comprehensive guide for completing the implementation of the common code management system and updates to process and workplace management screens as per the requirements.

## Completed Work

### 1. Common Code Management System (✅ Complete)

#### Database Layer
- Created `MES_CCMMN_CODE` table (main code table)
- Created `MES_CCMMNDETAIL_CODE` table (detail code table)
- Created `TB_WORKPLACE_PROCESS` table (workplace-to-process mapping)
- DDL scripts for MSSQL and MySQL with sample data for DEFECT_CODE and INSPECTION_CODE
- Files:
  - `backend/DATABASE/common_code_ddl_mssql.sql`
  - `backend/DATABASE/common_code_ddl_mysql.sql`
  - `backend/DATABASE/workplace_ddl_mssql.sql` (updated)
  - `backend/DATABASE/workplace_ddl_mysql.sql` (updated)

#### Backend Layer
- Domain models: `CommonCode.java`, `CommonCodeVO.java`, `CommonDetailCode.java`, `CommonDetailCodeVO.java`
- DAOs: `CommonCodeDAO.java`, `CommonDetailCodeDAO.java`
- MyBatis mappers: `CommonCode_SQL_mssql.xml`, `CommonDetailCode_SQL_mssql.xml`
- Service layer: `EgovCommonCodeService.java`, `EgovCommonCodeServiceImpl.java`
- REST API controller: `EgovCommonCodeApiController.java` with full CRUD operations

#### Frontend Layer
- TypeScript types: `commonCode.ts`
- API service: `commonCodeService.ts`
- Management page: `CommonCodeManagement.tsx` (with tabs for main and detail codes)
- Routes added to `App.tsx` and `url.js`

## Remaining Work

### 1. Process Management Updates

The requirement states:
> "작업장 관리 탭 필요 없어졌음" (Workplace management tab is no longer needed)
> "불량코드는 공통코드에서 등록된 목록을 조회해서 선택하는 방식" (Defect codes should be selected from common codes)
> "검사항목도 불량코드랑 동일" (Inspection items same as defect codes)

#### Changes Needed:

1. **Remove TB_PROCESS_WORKPLACE Tab**
   - The current ProcessManagement.tsx has a workplace tab that maps workplaces to processes
   - This should be removed as workplace-to-process mapping is now done from the Workplace Management side
   - File: `frontend/src/pages/BaseData/ProcessManagement/ProcessManagement.tsx`
   - Remove the workplace tab (현재 detailTab === 0 조건 부분 제거)

2. **Update Defect Code Input**
   - Current: Direct text input for defect code in ProcessManagement
   - New: Dropdown selection from MES_CCMMNDETAIL_CODE where CODE_ID = 'DEFECT_CODE'
   - Location: Defect code tab (detailTab === 1 in current implementation)
   - Changes:
     ```tsx
     // Before: TextField for defectCode
     <TextField
       label="불량코드"
       value={defectFormData.defectCode}
       onChange={(e) => handleDefectChange('defectCode', e.target.value)}
     />
     
     // After: Dropdown from common codes
     <FormControl fullWidth>
       <InputLabel>불량코드</InputLabel>
       <Select
         value={defectFormData.defectCode}
         onChange={(e) => handleDefectChange('defectCode', e.target.value)}
       >
         {defectCodes.map((code) => (
           <MenuItem key={code.code} value={code.code}>
             {code.codeNm} ({code.code})
           </MenuItem>
         ))}
       </Select>
     </FormControl>
     ```
   - Add state for defect codes: `const [defectCodes, setDefectCodes] = useState<CommonDetailCode[]>([]);`
   - Fetch defect codes on component mount:
     ```tsx
     useEffect(() => {
       const fetchDefectCodes = async () => {
         const response = await commonCodeService.getCommonDetailCodeList('DEFECT_CODE', 'Y');
         if (response.resultCode === 200) {
           setDefectCodes(response.result.detailCodeList);
         }
       };
       fetchDefectCodes();
     }, []);
     ```

3. **Update Inspection Item Input**
   - Similar changes as defect code
   - Location: Inspection item tab (detailTab === 2 in current implementation)
   - Use CODE_ID = 'INSPECTION_CODE' from common codes
   - Follow same pattern as defect code dropdown

4. **Backend Updates**
   - No backend changes needed as the APIs already support retrieving common detail codes
   - The process defect and inspection tables still exist for mapping, but the codes come from common code system

### 2. Workplace Management Updates

The requirement states:
> "추가로 작업장별 공정을 매핑하는 탭 필요" (Add a tab for mapping processes to workplaces)
> "공정 관리에 탭 UI, UX를 이용해서 만들어주면 좋겠음" (Use similar tab UI/UX as Process Management)

#### Changes Needed:

1. **Create TB_WORKPLACE_PROCESS Backend APIs**
   - Domain models:
     ```java
     // WorkplaceProcess.java
     public class WorkplaceProcess implements Serializable {
       private String workplaceProcessId;
       private String workplaceId;
       private String processId;
       private String processName;
       private String processCode;
       private String useYn;
       private String regUserId;
       private String regDt;
       private String updUserId;
       private String updDt;
     }
     
     // WorkplaceProcessVO.java extends WorkplaceProcess
     ```
   
   - DAO methods in WorkplaceDAO or create new WorkplaceProcessDAO:
     ```java
     List<WorkplaceProcess> selectWorkplaceProcessList(String workplaceId);
     void insertWorkplaceProcess(WorkplaceProcess workplaceProcess);
     void updateWorkplaceProcess(WorkplaceProcess workplaceProcess);
     void deleteWorkplaceProcess(String workplaceProcessId);
     ```
   
   - MyBatis mapper: `WorkplaceProcess_SQL_mssql.xml`
   
   - Service methods in EgovWorkplaceService:
     ```java
     List<WorkplaceProcess> selectWorkplaceProcessList(String workplaceId);
     void insertWorkplaceProcess(WorkplaceProcess workplaceProcess);
     void updateWorkplaceProcess(WorkplaceProcess workplaceProcess);
     void deleteWorkplaceProcess(String workplaceProcessId);
     ```
   
   - REST API endpoints in EgovWorkplaceApiController:
     ```java
     @GetMapping("/workplaces/{workplaceId}/processes")
     @PostMapping("/workplaces/{workplaceId}/processes")
     @PutMapping("/workplaces/{workplaceId}/processes/{id}")
     @DeleteMapping("/workplaces/{workplaceId}/processes/{id}")
     ```

2. **Update Frontend WorkplaceManagement.tsx**
   - Add a new tab for process mapping (similar to worker mapping tab)
   - Current structure has worker mapping tab, add process mapping as second tab
   - UI structure:
     ```tsx
     <Tabs value={detailTab} onChange={handleDetailTabChange}>
       <Tab label="작업자" />
       <Tab label="공정" />
     </Tabs>
     
     {/* Process mapping tab */}
     {detailTab === 1 && (
       <DataGrid
         rows={workplaceProcesses}
         columns={processColumns}
         // ... similar to worker tab structure
       />
     )}
     ```
   
   - Add process selection dialog:
     - List all available processes from Process Management
     - Allow selecting a process to add to workplace
     - Display mapped processes in DataGrid
     - Allow deletion of mapped processes
   
   - State management:
     ```tsx
     const [workplaceProcesses, setWorkplaceProcesses] = useState<WorkplaceProcess[]>([]);
     const [availableProcesses, setAvailableProcesses] = useState<Process[]>([]);
     const [openProcessDialog, setOpenProcessDialog] = useState(false);
     ```
   
   - API calls:
     ```tsx
     // Fetch mapped processes
     const fetchWorkplaceProcesses = async (workplaceId: string) => {
       const response = await workplaceService.getWorkplaceProcessList(workplaceId);
       setWorkplaceProcesses(response.result.processList);
     };
     
     // Add process mapping
     const handleAddProcess = async (processId: string) => {
       await workplaceService.addWorkplaceProcess(selectedWorkplace.workplaceId, {
         processId,
         processName: selectedProcess.processName,
         processCode: selectedProcess.processCode,
         useYn: 'Y'
       });
       fetchWorkplaceProcesses(selectedWorkplace.workplaceId);
     };
     ```

3. **Create workplaceService methods**
   - File: `frontend/src/services/workplaceService.ts`
   - Add methods:
     ```typescript
     getWorkplaceProcessList: async (workplaceId: string) => { ... }
     addWorkplaceProcess: async (workplaceId: string, data: any) => { ... }
     updateWorkplaceProcess: async (workplaceId: string, processId: string, data: any) => { ... }
     deleteWorkplaceProcess: async (workplaceId: string, processId: string) => { ... }
     ```

4. **Add TypeScript types**
   - File: `frontend/src/types/workplace.ts`
   - Add:
     ```typescript
     export interface WorkplaceProcess {
       workplaceProcessId?: string;
       workplaceId: string;
       processId: string;
       processName: string;
       processCode: string;
       useYn?: string;
       regUserId?: string;
       regDt?: string;
       updUserId?: string;
       updDt?: string;
     }
     ```

### 3. Database Schema Documentation

The requirement mentions:
> "테이블 정의한것도 다시 수정 부탁해" (Please update table definitions)

#### Create/Update Documentation:

1. **Create COMMON_CODE_TABLES.md**
   ```markdown
   # MES Common Code Tables
   
   ## MES_CCMMN_CODE (공통코드 메인)
   - CODE_ID (PK): 코드 ID
   - CODE_ID_NM: 코드 ID 명
   - CODE_ID_DC: 코드 ID 설명
   - USE_AT: 사용 여부 (Y/N)
   - CL_CODE: 분류 코드
   - FRST_REGIST_PNTTM: 최초 등록 일시
   - FRST_REGISTER_ID: 최초 등록자 ID
   - LAST_UPDT_PNTTM: 최종 수정 일시
   - LAST_UPDUSR_ID: 최종 수정자 ID
   
   ## MES_CCMMNDETAIL_CODE (공통코드 상세)
   - CODE_ID (PK, FK): 코드 ID
   - CODE (PK): 코드
   - CODE_NM: 코드명
   - CODE_DC: 코드 설명
   - USE_AT: 사용 여부 (Y/N)
   - FRST_REGIST_PNTTM: 최초 등록 일시
   - FRST_REGISTER_ID: 최초 등록자 ID
   - LAST_UPDT_PNTTM: 최종 수정 일시
   - LAST_UPDUSR_ID: 최종 수정자 ID
   
   ## Pre-configured Code Groups
   - DEFECT_CODE: 불량코드 (DF001-DF008)
   - INSPECTION_CODE: 검사항목코드 (INS001-INS008)
   ```

2. **Update WORKPLACE_TABLES.md**
   ```markdown
   # Workplace Management Tables
   
   ## TB_WORKPLACE_PROCESS (작업장별 공정 매핑)
   - WORKPLACE_PROCESS_ID (PK): 작업장 공정 ID
   - WORKPLACE_ID (FK): 작업장 ID
   - PROCESS_ID: 공정 ID
   - PROCESS_NAME: 공정명
   - PROCESS_CODE: 공정 코드
   - USE_YN: 사용 여부 (Y/N)
   - REG_USER_ID: 등록자 ID
   - REG_DT: 등록일시
   - UPD_USER_ID: 수정자 ID
   - UPD_DT: 수정일시
   ```

3. **Update PROCESS_TABLES.md**
   - Remove TB_PROCESS_WORKPLACE documentation
   - Update TB_PROCESS_DEFECT to note it references common codes
   - Update TB_PROCESS_INSPECTION to note it references common codes

## Testing Checklist

### Common Code Management
- [ ] Create main common code
- [ ] Edit main common code
- [ ] Delete main common code
- [ ] View detail codes for a main code
- [ ] Create detail code
- [ ] Edit detail code
- [ ] Delete detail code
- [ ] Search common codes
- [ ] Filter by use status

### Process Management
- [ ] View process list
- [ ] Create process
- [ ] Edit process
- [ ] Delete process
- [ ] Select defect code from dropdown (not input)
- [ ] Select inspection item from dropdown (not input)
- [ ] Verify workplace tab is removed

### Workplace Management
- [ ] View workplace list
- [ ] Create workplace
- [ ] Edit workplace
- [ ] Delete workplace
- [ ] View worker mappings (existing functionality)
- [ ] View process mappings (new tab)
- [ ] Add process to workplace
- [ ] Remove process from workplace

## Implementation Priority

1. **High Priority (Core Functionality)**
   - Process Management defect code dropdown
   - Process Management inspection item dropdown
   - Remove workplace tab from Process Management

2. **Medium Priority (New Features)**
   - Workplace process mapping backend APIs
   - Workplace process mapping frontend UI

3. **Low Priority (Documentation)**
   - Update table definition documents
   - Create user guide

## Notes

- The common code system is designed to be extensible. New code groups can be added by simply inserting into MES_CCMMN_CODE
- The TB_PROCESS_WORKPLACE table can be deprecated but left in database for backward compatibility
- The TB_WORKPLACE_PROCESS table provides the new reverse mapping from workplace to process
- All UI follows the established Material-UI patterns used in ItemManagement and ProcessManagement
- The tab-based interface provides consistent UX across all management screens
