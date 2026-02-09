import { useEffect, useState } from 'react';
import { useToast } from '../../../components/common/Feedback/ToastProvider';
import {
  ProdResultOrderRow,
  ProductionResultDetail,
} from '../../../types/productionResult';
import { productionResultService } from '../../../services/productionResultService';
import workplaceService from '../../../services/workplaceService';
import { WorkplaceWorker } from '../../../types/workplace';

export function useProdResultDetail(parentRow: ProdResultOrderRow) {
  const { showToast } = useToast();

  // 상태관리
  const [saving, setSaving] = useState(false); // 저장 중 여부 (중복 저장 방지)
  const [rows, setRows] = useState<ProductionResultDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [workplaceWorkers, setWorkplaceWorkers] = useState<WorkplaceWorker[]>([]);


  /** ======================
   *  조회 결과 정규화
   *  - worker: "A,B" → ["A","B"]
   *  ====================== */
  const normalizeRows = (rows: any[]): ProductionResultDetail[] =>
    rows.map((r) => ({
      ...r,
      workerCodes: Array.isArray(r.workerCodes)
          ? r.workerCodes
          : r.workerCodes
              ? r.workerCodes.split(',')
              : [],
    }));

  /** ======================
   *  실적 상세 조회
   *  ====================== */
  const fetchDetails = async () => {
    setLoading(true);

    try {
      const response = await productionResultService.getProdResultDetails(parentRow);
      const list = response.result?.resultList ?? [];
      setRows(normalizeRows(list));
    } catch (e) {
      console.log(e);
      showToast({
        message: '실적 상세 조회 중 오류가 발생했습니다.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };


  /** ======================
   *  신규 실적 행 추가
   *  ====================== */
  const addRow = () => {
    // console.log(parentRow);
    setRows((prev) => [
      ...prev,
      {
        id: `NEW-${Date.now()}`,

        factoryCode: parentRow.factoryCode,
        prodplanId: parentRow.prodplanId,
        prodplanDate: parentRow.prodplanDate,
        prodplanSeq: parentRow.prodplanSeq,
        prodworkSeq: parentRow.prodworkSeq,
        workSeq: parentRow.workSeq,
        prodSeq: parentRow.prodSeq,

        workdtDate: parentRow.workdtDate,
        prodStime: '',
        prodEtime: '',

        itemCode: parentRow.itemCode,
        workCode: parentRow.workCode,
        orderFlag: '',

        prodQty: 0,
        goodQty: 0,
        badQty: 0,
        rcvQty: 0,

        opmanCode: '',
        optime: '',
        opmanCode2: null,
        optime2: null,

        workorderSeq: null,
        erpSendFlag: null,
        erpRsltIdx: null,

        workerCodes: [],
        inputMaterial: '',

        tpr504Id: parentRow.tpr504Id,
        tpr601Id: `NEW-${Date.now()}`, // 신규 식별자
        __isModified: true, // 저장 대상 플래그
      },
    ]);
  };

  /** ======================
   *  행 수정 처리
   *  - 양품/불량 자동 계산
   *  - 수정 플래그 설정
   *  ====================== */
  const processRowUpdate = (
      newRow: ProductionResultDetail,
      oldRow: ProductionResultDetail
  ) => {
    const prod = Number(newRow.prodQty ?? 0);
    const good = Number(newRow.goodQty ?? 0);
    const bad  = Number(newRow.badQty ?? 0);

    // 기존 row를 기준으로 시작
    let nextRow: ProductionResultDetail = {
      ...oldRow,
      ...newRow, // newRow가 가진 값만 덮어씀 (workerCodes 포함)
    };

    // 양품 수정 → 불량 자동
    if (newRow.goodQty !== oldRow.goodQty) {
      nextRow.badQty = Math.max(prod - good, 0);
    }
    // 불량 수정 → 양품 자동
    if (newRow.badQty !== oldRow.badQty) {
      nextRow.goodQty = Math.max(prod - bad, 0);
    }
    // 생산수량 수정 → 불량 재계산
    if (newRow.prodQty !== oldRow.prodQty) {
      nextRow.goodQty = Math.max(prod - (nextRow.badQty ?? 0), 0);
    }

    nextRow.__isModified = true;

    setRows(prev =>
        prev.map(r =>
            r.tpr601Id === nextRow.tpr601Id ? nextRow : r
        )
    );

    return nextRow;
  };


  /** ======================
   *  저장 처리
   *  - 신규 / 수정 분리
   *  - 변경사항 없으면 중단
   *  ====================== */
  const handleSave = async () => {
    if (saving) return false;   // 중복 클릭 차단
    setSaving(true);

    const newRows = rows.filter((r) => r.tpr601Id.startsWith('NEW-'));
    const modifiedRows = rows.filter(
      (r) => !r.tpr601Id.startsWith('NEW-') && r.__isModified
    );

    if (newRows.length === 0 && modifiedRows.length === 0) {
      showToast({
        message: '저장할 변경사항이 없습니다.',
        severity: 'info',
      });
      return false;
    }

    let lastMessage = '저장되었습니다';

    try {
      // 수정 먼저
      if (modifiedRows.length > 0) {
        const { data } = await productionResultService.updateProdResult(
          modifiedRows
        );
        if (data.resultCode !== 200) {
          showToast({ message: data.resultMessage, severity: 'error' });
          return;
        }
        lastMessage = data.resultMessage;
      }

      // 신규
      if (newRows.length > 0) {
        const { data } = await productionResultService.createProdResult(
          newRows
        );
        if (data.resultCode !== 200) {
          showToast({ message: data.resultMessage, severity: 'error' });
          return;
        }
        lastMessage = data.resultMessage;
      }

      showToast({
        message: lastMessage,
        severity: 'success',
      });

      // 플래그 초기화
      setRows((prev) =>
        prev.map((r) => ({
          ...r,
          __isModified: false,
        }))
      );
      await fetchDetails();
      return true;
    } catch (e) {
      console.error(e);
      showToast({
        message: '저장 중 오류가 발생했습니다.',
        severity: 'error',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  /** ======================
   *  실적 행 삭제
   *  ====================== */
  const handleDeleteRow = async (row: ProductionResultDetail) => {
    // 신규 추가 행 → 바로 제거
    if (row.tpr601Id.startsWith('NEW-')) {
      setRows((prev) => prev.filter((r) => r.tpr601Id !== row.tpr601Id));
      return;
    }

    // 기존 행 → 확인
    if (!window.confirm('해당 실적을 삭제하시겠습니까?')) return;

    let lastMessage = '삭제되었습니다';

    // // 실제 삭제는 저장 시 처리 → 여기서는 제거
    try {
      const { data } = await productionResultService.deleteProdResult(row);
      if (data.resultCode !== 200) {
        showToast({ message: data.resultMessage, severity: 'error' });
        return;
      }
      lastMessage = data.resultMessage;

      // 화면에서도 제거
      setRows((prev) => prev.filter((r) => r.tpr601Id !== row.tpr601Id));

      showToast({
        message: lastMessage,
        severity: 'success',
      });
    } catch (e) {
      console.error(e);
      showToast({
        message: '삭제 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  /** ======================
   *  작업자 목록 조회
   *  ====================== */
  const fetchWorkers = async () => {
    try {
      const response = await workplaceService.getWorkplaceWorkers(
        parentRow.workcenterCode
      );
      if (response.resultCode === 200) {
        setWorkplaceWorkers(response.result?.resultList ?? []);
      }
    } catch (error) {
      showToast({
        message: 'Failed to load workplace workers:' + error,
        severity: 'error',
      });
      setWorkplaceWorkers([]);
    }
  };

  /** ======================
   *  작업자 선택 옵션
   *  ====================== */
  const workerOptions = workplaceWorkers.map((w) => ({
    value: w.workerCode.trim(),
    label: w.workerName,
  }));

  /** ======================
   *  작업장 변경 시 작업자 재조회
   *  ====================== */
  useEffect(() => {
    if (!parentRow?.workcenterCode) return;
    fetchWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentRow.workcenterCode]);

  return {
    rows,
    setRows,
    addRow,
    loading,

    processRowUpdate,
    handleSave,
    handleDeleteRow,

    fetchDetails,
    workerOptions,
  };
}
