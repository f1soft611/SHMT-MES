import { useCallback, useEffect, useState } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { workplaceKpiService } from '../../../services/workplaceKpiService';
import {
  WorkplaceKpiReqDTO,
  WorkplaceKpiRow,
  WorkplaceKpiSearchParams,
  WorkplaceKpiSummaryRow,
} from '../../../types/workplaceKpi';
import { useToast } from '../../../components/common/Feedback/ToastProvider';
import { useFetchWorkplaces } from '../../../hooks/useFetchWorkplaces';

const PAGE_SIZE = 100;
const ALL_SIZE = 9999;

/** yyyyMMdd 포맷 변환 (날짜 문자열 → 불필요 문자 제거) */
function toYyyyMmDd(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 8);
}

/** 엑셀 날짜 시리얼(OA Date) → yyyyMMdd */
function excelSerialToYyyyMmDd(serial: number): string {
  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400 * 1000);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function parseWorkDate(raw: unknown): string {
  if (typeof raw === 'number') return excelSerialToYyyyMmDd(raw);
  if (typeof raw === 'string') return toYyyyMmDd(raw);
  return '';
}

function toNumber(raw: unknown): number {
  const n = Number(raw);
  return isNaN(n) ? 0 : n;
}

/** 로우 데이터를 일별+작업장+공정 기준으로 집계 */
function computeSummaryFromRows(
  allRows: WorkplaceKpiRow[],
): WorkplaceKpiSummaryRow[] {
  const map = new Map<string, WorkplaceKpiSummaryRow>();
  for (const row of allRows) {
    const key = `${row.workDate}_${row.workcenterCode}_${row.processType}`;
    const prev = map.get(key);
    if (prev) {
      prev.totalProdQty = (prev.totalProdQty ?? 0) + (row.prodQty ?? 0);
      prev.totalGoodQty = (prev.totalGoodQty ?? 0) + (row.goodQty ?? 0);
      prev.totalBadQty = (prev.totalBadQty ?? 0) + (row.badQty ?? 0);
      prev.totalWorkTime = (prev.totalWorkTime ?? 0) + (row.workTime ?? 0);
      prev.rowCount = (prev.rowCount ?? 0) + 1;
    } else {
      map.set(key, {
        workDate: row.workDate,
        workcenterCode: row.workcenterCode,
        processType: row.processType,
        totalProdQty: row.prodQty ?? 0,
        totalGoodQty: row.goodQty ?? 0,
        totalBadQty: row.badQty ?? 0,
        avgBadRate: 0,
        totalWorkTime: row.workTime ?? 0,
        avgQtyPerHour: 0,
        rowCount: 1,
      });
    }
  }
  return Array.from(map.values()).map((r) => ({
    ...r,
    avgBadRate: r.totalProdQty > 0 ? (r.totalBadQty / r.totalProdQty) * 100 : 0,
    avgQtyPerHour: r.totalWorkTime > 0 ? r.totalProdQty / r.totalWorkTime : 0,
  }));
}

const DEFAULT_SEARCH: WorkplaceKpiSearchParams = {
  workcenterCode: '',
  yearMonth: dayjs().format('YYYYMM'),
};

export function useWorkplaceKpi() {
  const { showToast } = useToast();
  const { workplaces } = useFetchWorkplaces();

  const [search, setSearch] =
    useState<WorkplaceKpiSearchParams>(DEFAULT_SEARCH);
  const [rows, setRows] = useState<WorkplaceKpiRow[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [summaryRows, setSummaryRows] = useState<WorkplaceKpiSummaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGE_SIZE,
  });

  const fetchList = useCallback(
    async (
      params: WorkplaceKpiSearchParams,
      page: number,
      pageSize: number,
    ) => {
      setLoading(true);
      try {
        // 페이짜 데이터(그리드용) + 전체 데이터(차트용) 동시 요청
        const [listRes, allRes] = await Promise.all([
          workplaceKpiService.getKpiList(params, page, pageSize),
          workplaceKpiService.getKpiList(params, 0, ALL_SIZE),
        ]);
        if (listRes.resultCode === 200) {
          setRows(listRes.result?.resultList ?? []);
          setRowCount(listRes.result?.resultCnt ?? 0);
        }
        if (allRes.resultCode === 200) {
          const allRows = allRes.result?.resultList ?? [];
          setSummaryRows(computeSummaryFromRows(allRows));
        }
      } catch {
        showToast({
          message: '데이터 조회 중 오류가 발생했습니다.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const onSearch = useCallback(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    fetchList(search, 0, paginationModel.pageSize);
  }, [search, paginationModel.pageSize, fetchList]);

  const onPaginationChange = useCallback(
    (model: GridPaginationModel) => {
      setPaginationModel(model);
      fetchList(search, model.page, model.pageSize);
    },
    [search, fetchList],
  );

  const onChange = useCallback(
    (name: keyof WorkplaceKpiSearchParams, value: string) => {
      setSearch((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  /** 엑셀 파싱 후 업로드 */
  const onFileUpload = useCallback(
    async (file: File) => {
      if (!search.workcenterCode) {
        showToast({
          message: '업로드 전 작업장을 먼저 선택해주세요.',
          severity: 'warning',
        });
        return;
      }
      try {
        setUploading(true);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const XLSX = require('xlsx') as typeof import('xlsx') & {
          read: (
            data: ArrayBuffer,
            opts?: { type: string },
          ) => {
            SheetNames: string[];
            Sheets: Record<string, unknown>;
          };
          utils: {
            sheet_to_json: (
              sheet: unknown,
              opts?: { header?: number; defval?: unknown },
            ) => unknown[][];
          };
        };
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        // header: 1 → 2차원 배열로 파싱 (헤더 행 건너뜀)
        const rawRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: '',
        });

        // 첫 2행(헤더+단위) 제거, 마지막 합계행 제거 (빈 날짜 or '합 계' 포함 행)
        const dataRows = rawRows.slice(2).filter((row) => {
          const dateCell = row[2];
          const dateStr = parseWorkDate(dateCell);
          return dateStr.length === 8;
        });

        if (dataRows.length === 0) {
          showToast({
            message: '유효한 데이터가 없습니다. 엑셀 형식을 확인해주세요.',
            severity: 'warning',
          });
          return;
        }

        const dtoList: WorkplaceKpiReqDTO[] = dataRows.map((row) => ({
          workcenterCode: search.workcenterCode,
          processType: String(row[1] ?? ''),
          workDate: parseWorkDate(row[2]),
          workOrderNo: String(row[3] ?? ''),
          itemName: String(row[4] ?? ''),
          itemCode: String(row[5] ?? ''),
          prodQty: toNumber(row[6]),
          goodQty: toNumber(row[7]),
          badQty: toNumber(row[8]),
          badRate: toNumber(row[9]),
          workTime: toNumber(row[10]),
          qtyPerHour: toNumber(row[11]),
        }));

        const res = await workplaceKpiService.uploadKpiData(dtoList);
        if (res.resultCode === 200) {
          showToast({
            message: `${res.result?.savedCount ?? dtoList.length}건 저장되었습니다.`,
            severity: 'success',
          });
          onSearch();
        } else {
          showToast({ message: '업로드에 실패했습니다.', severity: 'error' });
        }
      } catch {
        showToast({
          message: '파일 처리 중 오류가 발생했습니다.',
          severity: 'error',
        });
      } finally {
        setUploading(false);
      }
    },
    [search.workcenterCode, onSearch, showToast],
  );

  // 초기 로드
  useEffect(() => {
    fetchList(DEFAULT_SEARCH, 0, PAGE_SIZE);
  }, [fetchList]);

  return {
    workplaces,
    search,
    rows,
    rowCount,
    summaryRows,
    loading,
    uploading,
    paginationModel,
    onChange,
    onSearch,
    onFileUpload,
    onPaginationChange,
  };
}
