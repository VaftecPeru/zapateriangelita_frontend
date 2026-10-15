import { useEffect, useMemo, useState } from 'react';

export const usePagination = <T,>(items: T[], initialPageSize = 25) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));

  useEffect(() => {
    setPage((current) => Math.min(Math.max(1, current), totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const setPageSize = (value: number) => {
    const safeValue = Math.max(1, Number(value) || initialPageSize);
    setPageSizeState(safeValue);
    setPage(1);
  };

  const resetPage = () => setPage(1);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    setPage,
    setPageSize,
    resetPage,
  };
};
