import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface UrlState {
  page: number;
  pageSize: number;
  dateFrom?: string;
  dateTo?: string;
  keyword?: string;
}

export const useUrlState = (defaultState: UrlState) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<UrlState>(defaultState);

  // Initialize state from URL on mount
  useEffect(() => {
    const urlState: UrlState = {
      page: parseInt(searchParams.get('page') || '0', 10),
      pageSize: parseInt(searchParams.get('pageSize') || defaultState.pageSize.toString(), 10),
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      keyword: searchParams.get('keyword') || undefined,
    };

    setState(urlState);
  }, [searchParams, defaultState.pageSize]);

  // Update URL when state changes
  const updateUrlState = useCallback((newState: Partial<UrlState>) => {
    const updatedState = { ...state, ...newState };
    setState(updatedState);

    const params = new URLSearchParams();
    
    // Only set non-default/non-empty values
    if (updatedState.page > 0) {
      params.set('page', updatedState.page.toString());
    }
    
    if (updatedState.pageSize !== defaultState.pageSize) {
      params.set('pageSize', updatedState.pageSize.toString());
    }
    
    if (updatedState.dateFrom) {
      params.set('dateFrom', updatedState.dateFrom);
    }
    
    if (updatedState.dateTo) {
      params.set('dateTo', updatedState.dateTo);
    }
    
    if (updatedState.keyword) {
      params.set('keyword', updatedState.keyword);
    }

    setSearchParams(params);
  }, [state, defaultState.pageSize, setSearchParams]);

  // Reset to default state
  const resetUrlState = useCallback(() => {
    setState(defaultState);
    setSearchParams({});
  }, [defaultState, setSearchParams]);

  return {
    state,
    updateUrlState,
    resetUrlState,
  };
};