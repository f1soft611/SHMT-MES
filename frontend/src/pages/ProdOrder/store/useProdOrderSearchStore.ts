import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProdPlanSearchParams } from '../../../types/productionOrder';
import dayjs from 'dayjs';

function getDefaultSearch(): ProdPlanSearchParams {
  return {
    workplace: '',
    equipment: '',
    keyword: '',
    dateFrom: dayjs().format('YYYY-MM-DD'),
    dateTo: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    prodFrom: '',
    prodTo: '',
    orderFlag: 'PLANNED',
  };
}

interface ProdOrderSearchStoreState {
  search: ProdPlanSearchParams;
  setSearch: (search: ProdPlanSearchParams) => void;
}

export const useProdOrderSearchStore = create<ProdOrderSearchStoreState>()(
  persist(
    (set) => ({
      search: getDefaultSearch(),
      setSearch: (search) => set({ search }),
    }),
    {
      name: 'prod-order-search',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
