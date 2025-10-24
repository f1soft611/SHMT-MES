# Process Management UI Changes - Visual Guide

## Before Changes

### Tab Structure (3 tabs):
```
┌─────────────────────────────────────────────────────┐
│  [작업장 매핑] [불량코드 관리] [검사항목 관리]          │
└─────────────────────────────────────────────────────┘
```

### Defect Code Dialog (Before):
```
┌───────────────────────────────────────┐
│  불량코드 등록                           │
├───────────────────────────────────────┤
│  불량 코드: [____________]  ← Text Input│
│  불량명:    [____________]  ← Text Input│
│  불량 타입: [____________]  ← Text Input│
│  설명:      [____________]  ← Text Input│
├───────────────────────────────────────┤
│           [저장]  [취소]               │
└───────────────────────────────────────┘
```

### Inspection Dialog (Before):
```
┌───────────────────────────────────────┐
│  검사항목 등록                          │
├───────────────────────────────────────┤
│  검사 코드:  [____________]  ← Text Input│
│  검사항목명: [____________]  ← Text Input│
│  검사 타입:  [____________]  ← Text Input│
│  기준값:     [____________]            │
│  상한값:     [____] 하한값: [____]      │
│  단위:       [____]                    │
│  설명:       [____________]  ← Text Input│
├───────────────────────────────────────┤
│           [저장]  [취소]               │
└───────────────────────────────────────┘
```

---

## After Changes ✨

### Tab Structure (2 tabs):
```
┌─────────────────────────────────────────────────────┐
│  [불량코드 관리] [검사항목 관리]                      │
└─────────────────────────────────────────────────────┘
```
❌ **작업장 매핑 탭 제거됨** - 작업장 관리 화면에서 공정 매핑 기능으로 이동 예정

### Defect Code Dialog (After):
```
┌───────────────────────────────────────────────────┐
│  불량코드 등록                                       │
├───────────────────────────────────────────────────┤
│  불량코드: [▼ Dropdown Selection         ]  ← NEW! │
│            ┌──────────────────────────────┐       │
│            │ 조립불량 (DF001)              │       │
│            │ 치수불량 (DF002)              │       │
│            │ 도장불량 (DF003)              │       │
│            │ 외관불량 (DF004)              │       │
│            │ 긁힘 (DF005)                  │       │
│            │ 찍힘 (DF006)                  │       │
│            │ 변형 (DF007)                  │       │
│            │ 오염 (DF008)                  │       │
│            └──────────────────────────────┘       │
│                                                   │
│  불량명:    [조립불량        ] ← Auto-filled 🔒   │
│  불량 타입: [____________  ]  ← Editable         │
│  설명:      [부품 조립 불량  ] ← Auto-filled 🔒   │
├───────────────────────────────────────────────────┤
│           [저장]  [취소]                           │
└───────────────────────────────────────────────────┘
```

### Inspection Dialog (After):
```
┌───────────────────────────────────────────────────┐
│  검사항목 등록                                      │
├───────────────────────────────────────────────────┤
│  검사코드: [▼ Dropdown Selection         ]  ← NEW!│
│            ┌──────────────────────────────┐       │
│            │ 조립강도 (INS001)             │       │
│            │ 치수정밀도 (INS002)           │       │
│            │ 도막두께 (INS003)             │       │
│            │ 외관검사 (INS004)             │       │
│            │ 중량검사 (INS005)             │       │
│            │ 경도검사 (INS006)             │       │
│            │ 전기저항 (INS007)             │       │
│            │ 내압검사 (INS008)             │       │
│            └──────────────────────────────┘       │
│                                                   │
│  검사항목명: [조립강도      ] ← Auto-filled 🔒     │
│  검사 타입:  [____________ ]  ← Editable          │
│  기준값:     [____________ ]                      │
│  상한값:     [____] 하한값: [____]                 │
│  단위:       [____]                               │
│  설명:       [조립 강도 측정] ← Auto-filled 🔒     │
├───────────────────────────────────────────────────┤
│           [저장]  [취소]                           │
└───────────────────────────────────────────────────┘
```

---

## Key Features

### ✅ Benefits:
1. **Data Consistency** - All users select from same predefined codes
2. **Reduced Errors** - No typos in code entry
3. **Faster Input** - Auto-fills name and description
4. **Centralized Management** - Codes managed in one place (공통코드 관리)
5. **Simplified UI** - One less tab to manage

### 🔒 Data Integrity:
- **Dropdown disabled after creation** - Cannot change code once saved
- **Name and description auto-filled** - Prevents inconsistent naming
- **Type field still editable** - Allows customization per process

### 📊 Code Sources:
- **Defect Codes**: `MES_CCMMNDETAIL_CODE` where `CODE_ID = 'DEFECT_CODE'`
- **Inspection Codes**: `MES_CCMMNDETAIL_CODE` where `CODE_ID = 'INSPECTION_CODE'`
- Can be managed via 공통코드 관리 screen (`/base/common-code`)

---

## Technical Implementation

### Auto-population Logic:
```typescript
// Defect Code Selection
const handleDefectCodeChange = (code: string) => {
  const selectedCode = defectCodes.find(dc => dc.code === code);
  if (selectedCode) {
    setFormData({ 
      ...formData, 
      defectCode: selectedCode.code,
      defectName: selectedCode.codeNm,        // Auto-filled
      description: selectedCode.codeDc || '', // Auto-filled
    });
  }
};

// Inspection Code Selection
const handleInspectionCodeChange = (code: string) => {
  const selectedCode = inspectionCodes.find(ic => ic.code === code);
  if (selectedCode) {
    setFormData({ 
      ...formData, 
      inspectionCode: selectedCode.code,
      inspectionName: selectedCode.codeNm,     // Auto-filled
      description: selectedCode.codeDc || '',  // Auto-filled
    });
  }
};
```

### API Integration:
```typescript
// Fetch defect codes from common code system
const fetchDefectCodes = async () => {
  const response = await commonCodeService.getCommonDetailCodeList('DEFECT_CODE', 'Y');
  // Returns only active (USE_AT = 'Y') codes
};

// Fetch inspection codes from common code system
const fetchInspectionCodes = async () => {
  const response = await commonCodeService.getCommonDetailCodeList('INSPECTION_CODE', 'Y');
  // Returns only active (USE_AT = 'Y') codes
};
```
