# Item Management Page - UI Guide

## Main Page Layout

### Top Section
```
┌─────────────────────────────────────────────────────────────────┐
│ 품목 관리                                    [+ 품목 등록]         │
└─────────────────────────────────────────────────────────────────┘
```

### Search Panel
```
┌─────────────────────────────────────────────────────────────────┐
│ [검색조건 ▼]  [품목타입 ▼]  [검색어 입력...]  [🔍 검색]           │
│  (품목코드/품목명/규격)  (전체/제품/자재)                          │
└─────────────────────────────────────────────────────────────────┘
```

### Data Grid
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 품목코드 │ 품목명      │ 품목타입 │ 규격        │ 단위 │ 재고수량 │ 등록일       │ 관리  │
├─────────────────────────────────────────────────────────────────────────────┤
│ PRD-001  │ A타입 제품  │ [제품]   │ 100x200x50  │ EA  │ 150     │ 2025-10-24  │ ✏️ 🗑️ │
│ PRD-002  │ B타입 제품  │ [제품]   │ 150x250x60  │ EA  │ 200     │ 2025-10-24  │ ✏️ 🗑️ │
│ MAT-001  │ 스틸 원자재 │ [자재]   │ SS400 10mm  │ KG  │ 1000    │ 2025-10-24  │ ✏️ 🗑️ │
│ ...                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Detail Dialog (Create/Edit)

### Create New Item Dialog
```
┌────────────────── 품목 등록 ────────────────────┐
│                                                  │
│  [품목코드: ________] [품목명: ________]         │
│                                                  │
│  [품목타입: 제품 ▼]   [규격: ________]           │
│                                                  │
│  [단위: ____]  [재고수량: ____]  [안전재고: ____]│
│                                                  │
│  [사용여부: 사용 ▼]  [인터페이스여부: 아니오 ▼]  │
│                                                  │
│  [비고:                                         ]│
│  [_____________________________________________] │
│  [_____________________________________________] │
│                                                  │
│                     [저장]  [취소]               │
└──────────────────────────────────────────────────┘
```

### Edit Item Dialog (with Interface Item)
```
┌────────────────── 품목 수정 ────────────────────┐
│                                                  │
│  [품목코드: PRD-001] (인터페이스 항목은 수정불가) │
│                                                  │
│  [품목명: A타입 제품] (인터페이스 항목은 수정불가)│
│                                                  │
│  [품목타입: 제품 ▼]   [규격: 100x200x50mm]       │
│    (읽기전용)          (읽기전용)                 │
│                                                  │
│  [단위: EA]  [재고수량: 150]  [안전재고: 50]      │
│   (읽기전용)                                     │
│                                                  │
│  [사용여부: 사용 ▼]  [인터페이스여부: 예 ▼]      │
│                      (읽기전용)                   │
│                                                  │
│  [비고: ERP 연동 품목                            ]│
│  [_____________________________________________] │
│                                                  │
│                     [저장]  [취소]               │
└──────────────────────────────────────────────────┘
```

## Color Coding

- **제품 (PRODUCT)**: Blue chip badge
- **자재 (MATERIAL)**: Gray chip badge
- **Interface Items**: Fields shown as read-only with helper text
- **MES Items**: All fields editable

## User Interactions

1. **Search Flow**:
   - Select search condition (Item Code / Item Name / Specification)
   - Optionally select item type filter (All / Product / Material)
   - Enter search keyword
   - Click Search button or press Enter
   - Grid updates with filtered results

2. **Create Flow**:
   - Click "+ 품목 등록" button
   - Dialog opens with empty form
   - Fill in required fields (Item Code, Item Name)
   - Optional fields can be left empty
   - Click "저장" to save
   - Success message appears
   - Grid refreshes with new item

3. **Edit Flow**:
   - Click edit icon (✏️) on desired row
   - Dialog opens with item data
   - Interface items show read-only restrictions
   - Modify editable fields
   - Click "저장" to save changes
   - Success message appears
   - Grid refreshes

4. **Delete Flow**:
   - Click delete icon (🗑️) on desired row
   - Confirmation dialog appears: "정말 삭제하시겠습니까?"
   - Click OK to confirm
   - Success message appears
   - Grid refreshes

## Validation Messages

- ✅ "품목이 등록되었습니다." (Item created)
- ✅ "품목이 수정되었습니다." (Item updated)
- ✅ "품목이 삭제되었습니다." (Item deleted)
- ❌ "이미 존재하는 품목 코드입니다." (Duplicate item code)
- ❌ "품목 목록을 불러오는데 실패했습니다." (Failed to load items)
- ❌ "저장에 실패했습니다." (Save failed)
- ❌ "삭제에 실패했습니다." (Delete failed)

## Grid Features

- Sort by any column (click column header)
- Auto-height rows
- No pagination (all results shown)
- Hover effect on rows
- Center-aligned text
- Responsive column widths using flex

## Accessibility

- Keyboard navigation support (Tab, Enter)
- Screen reader friendly labels
- Clear visual focus indicators
- High contrast color scheme
- Descriptive button labels

## Mobile Responsiveness

- Grid columns adjust to screen width
- Dialog becomes full-screen on small devices
- Touch-friendly button sizes
- Swipe gestures on DataGrid
