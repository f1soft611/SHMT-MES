import {useEffect, useState} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../components/common/Feedback/ToastProvider';
import {
  ProdResultOrderRow,
  ProductionResultDetail,
} from '../../../types/productionResult';
import { productionResultService } from '../../../services/productionResultService';
import workplaceService from '../../../services/workplaceService';
import { WorkplaceWorker } from '../../../types/workplace';
import dayjs from "dayjs";

// 실적 상세 조회 쿼리 키 (parentRow를 식별하는 복합키 기준)
const prodResultDetailsKey = (row: ProdResultOrderRow | null) => [
  'prodResultDetails',
  row?.prodplanId,
  row?.prodplanDate,
  row?.prodplanSeq,
  row?.prodworkSeq,
  row?.workSeq,
  row?.prodSeq,
] as const;

export function useProdResultDetail(parentRow: ProdResultOrderRow | null) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // 상태관리
  const [rows, setRows] = useState<ProductionResultDetail[]>([]);
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
  const detailsQuery = useQuery({
    queryKey: prodResultDetailsKey(parentRow),
    queryFn: () => productionResultService.getProdResultDetails(parentRow as ProdResultOrderRow),
    enabled: Boolean(parentRow),
  });
  const loading = detailsQuery.isFetching;

  useEffect(() => {
    if (!parentRow) {
      setRows([]);
      return;
    }
    if (detailsQuery.isError) {
      showToast({
        message: '실적 상세 조회 중 오류가 발생했습니다.',
        severity: 'error',
      });
      return;
    }
    if (detailsQuery.data) {
      setRows(normalizeRows(detailsQuery.data.result?.resultList ?? []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentRow, detailsQuery.data, detailsQuery.isError]);

  const fetchDetails = async () => {
    await detailsQuery.refetch();
  };


  /** ======================
   *  신규 실적 행 추가
   *  ====================== */
  const addRow = () => {
    if (!parentRow) return;
    const now = dayjs();
    const baseWorkDate = parentRow.workdtDate?.trim();
    const normalizedWorkDate = baseWorkDate
      ? (baseWorkDate.includes('-')
          ? dayjs(baseWorkDate, 'YYYY-MM-DD', true)
          : dayjs(baseWorkDate, 'YYYYMMDD', true))
      : null;
    const defaultDate = normalizedWorkDate?.isValid() ? normalizedWorkDate : now;
    const defaultDateTime = defaultDate
      .hour(now.hour())
      .minute(now.minute())
      .second(0)
      .millisecond(0)
      .format('YYYY-MM-DD HH:mm');

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
        prodStime: defaultDateTime,
        prodEtime: defaultDateTime,

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

    // 시간 검증 추가
    const start = newRow.prodStime ? dayjs(newRow.prodStime) : null;
    const end = newRow.prodEtime ? dayjs(newRow.prodEtime) : null;

    if (start && end && !end.isAfter(start)) {
      showToast({
        message: '종료시간은 시작시간보다 커야 합니다.',
        severity: 'error',
      });

      return oldRow;
    }


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
    // 생산수량 수정 → 불량 재계산 (불량이 생산수량을 넘지 않도록 함께 clamp)
    if (newRow.prodQty !== oldRow.prodQty) {
      nextRow.badQty = Math.min(nextRow.badQty ?? 0, prod);
      nextRow.goodQty = Math.max(prod - nextRow.badQty, 0);
    }

    nextRow.__isModified = true;
    nextRow.prodEtime = newRow.prodEtime?.trim() ? newRow.prodEtime : null;
    // ORDER_FLAG 세팅
    nextRow.orderFlag = nextRow.prodEtime ? '1' : '2';


    setRows(prev =>
        prev.map(r =>
            r.tpr601Id === nextRow.tpr601Id ? nextRow : r
        )
    );

    return nextRow;
  };


  const updateMutation = useMutation({
    mutationFn: (data: ProductionResultDetail[]) =>
      productionResultService.updateProdResult(data),
  });
  const createMutation = useMutation({
    mutationFn: (data: ProductionResultDetail[]) =>
      productionResultService.createProdResult(data),
  });
  const deleteMutation = useMutation({
    mutationFn: (row: ProductionResultDetail) =>
      productionResultService.deleteProdResult(row),
  });
  const saving = updateMutation.isPending || createMutation.isPending;

  /** ======================
   *  저장 처리
   *  - 신규 / 수정 분리
   *  - 변경사항 없으면 중단
   *  ====================== */
  const handleSave = async () => {
    if (saving) return false;   // 중복 클릭 차단

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

    const targetRows = [...newRows, ...modifiedRows];

    // 🔥 추가: goodQty 검증
    const invalidRow = targetRows.find((r) => Number(r.prodQty ?? 0) <= 0);
    if (invalidRow) {
      showToast({
        message: '생산수량은 0보다 커야 합니다.',
        severity: 'warning',
      });
      return false;
    }

    let lastMessage = '저장되었습니다';

    try {
      // 수정 먼저
      if (modifiedRows.length > 0) {
        const { data } = await updateMutation.mutateAsync(modifiedRows);
        if (data.resultCode !== 200) {
          showToast({ message: data.resultMessage, severity: 'error' });
          return false;
        }
        lastMessage = data.resultMessage;
      }

      // 신규
      if (newRows.length > 0) {
        const { data } = await createMutation.mutateAsync(newRows);
        if (data.resultCode !== 200) {
          showToast({ message: data.resultMessage, severity: 'error' });
          return false;
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
      await queryClient.invalidateQueries({ queryKey: prodResultDetailsKey(parentRow) });
      return true;
    } catch (e) {
      console.error(e);
      showToast({
        message: '저장 중 오류가 발생했습니다.',
        severity: 'error',
      });
      return false;
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

    try {
      const { data } = await deleteMutation.mutateAsync(row);
      if (data.resultCode !== 200) {
        showToast({ message: data.resultMessage, severity: 'error' });
        return;
      }

      // 화면에서도 제거
      setRows((prev) => prev.filter((r) => r.tpr601Id !== row.tpr601Id));

      showToast({
        message: data.resultMessage,
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
    if (!parentRow) return;
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
  const workcenterCode = parentRow?.workcenterCode;
  useEffect(() => {
    if (!workcenterCode) return;
    fetchWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workcenterCode]);

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
