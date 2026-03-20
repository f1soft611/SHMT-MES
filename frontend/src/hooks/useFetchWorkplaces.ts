import { useEffect, useState } from 'react';
import { Workplace } from '../types/workplace';
import workplaceService from '../services/workplaceService';

export function useFetchWorkplaces() {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);

  const fetchWorkplaces = async () => {
    try {
      const response = await workplaceService.getWorkplaceList(0, 100, {
        useYn: 'Y',
      });
      if (response.resultCode === 200 && response.result?.resultList) {
        setWorkplaces(response.result.resultList);
      }
    } catch (err: any) {
      console.error('Failed to load workplaces:', err);
      setWorkplaces([]);
    }
  };

  useEffect(() => {
    fetchWorkplaces();
  }, []);

  return {
    workplaces,
    refetchWorkplaces: fetchWorkplaces,
  };
}
