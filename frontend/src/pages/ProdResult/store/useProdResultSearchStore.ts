import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProductionResultSearchForm } from '../../../types/productionResult';
import dayjs from 'dayjs';

function getDefaultSearch(): ProductionResultSearchForm {
  return {
    workplace: '',
    equipment: '',
    keyword: '',
    dateFrom: dayjs().format('YYYY-MM-DD'),
    dateTo: dayjs().add(7, 'day').format('YYYY-MM-DD'),
  };
}

interface ProdResultSearchStoreState {
  search: ProductionResultSearchForm;
  setSearch: (search: ProductionResultSearchForm) => void;
}

export const useProdResultSearchStore = create<ProdResultSearchStoreState>()(
  persist(
    (set) => ({
      search: getDefaultSearch(),
      setSearch: (search) => set({ search }),
    }),
    {
      name: 'prod-result-search',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
