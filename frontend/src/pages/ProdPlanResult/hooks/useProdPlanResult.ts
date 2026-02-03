import { useCallback, useEffect, useMemo, useState } from 'react';
import productionPlanService from '../../../services/productionPlanService';
import { ProdPlanResultRow } from '../../../types/prodPlanResult';

const getDefaultYearMonth = () => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
};

const normalizeNumber = (value: any) => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const normalizeRow = (row: any): ProdPlanResultRow => {
  return {
    workplaceCode: row.workplaceCode ?? '',
    workplaceName: row.workplaceName ?? '',
    rowType: row.rowType ?? 'PLAN',
    rowTypeName: row.rowTypeName ?? '',
    monthTarget: normalizeNumber(row.monthTarget),
    monthPlan: normalizeNumber(row.monthPlan),
    orderBacklog: normalizeNumber(row.orderBacklog),
    nextMonthCarry: normalizeNumber(row.nextMonthCarry),
    total: normalizeNumber(row.total),
    days: Array.isArray(row.days) ? row.days.map(normalizeNumber) : [],
    weekTotals: Array.isArray(row.weekTotals)
      ? row.weekTotals.map(normalizeNumber)
      : [],
  };
};

const YEAR_MONTH_STORAGE_KEY = 'prodPlanResult.yearMonth';

export const useProdPlanResult = () => {
  const [yearMonth, setYearMonth] = useState(() => {
    try {
      const stored = sessionStorage.getItem(YEAR_MONTH_STORAGE_KEY);
      return stored && stored.length === 7 ? stored : getDefaultYearMonth();
    } catch {
      return getDefaultYearMonth();
    }
  });
  const [rows, setRows] = useState<ProdPlanResultRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const yearMonthParam = useMemo(() => yearMonth.replace('-', ''), [yearMonth]);

  const fetchResults = useCallback(async () => {
    if (!yearMonthParam || yearMonthParam.length !== 6) {
      setRows([]);
      return;
    }

    try {
      setLoading(true);
      const response = await productionPlanService.getMonthlyPlanResult({
        yearMonth: yearMonthParam,
      });
      const resultRows = response.result?.resultList ?? [];
      setRows(resultRows.map(normalizeRow));
    } catch (error) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [yearMonthParam]);

  const handleSearch = () => {
    setSearchTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    fetchResults();
  }, [fetchResults, searchTrigger]);

  useEffect(() => {
    try {
      sessionStorage.setItem(YEAR_MONTH_STORAGE_KEY, yearMonth);
    } catch {
      // ignore
    }
  }, [yearMonth]);

  return {
    yearMonth,
    setYearMonth,
    rows,
    loading,
    handleSearch,
  };
};
