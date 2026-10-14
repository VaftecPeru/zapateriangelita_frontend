import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

type Props = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  compact?: boolean;
};

const Pagination = ({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  compact = false,
}: Props) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = totalItems === 0 ? 0 : ((safePage - 1) * pageSize) + 1;
  const end = Math.min(totalItems, safePage * pageSize);

  const visiblePages = Array.from(
    new Set([
      1,
      Math.max(1, safePage - 1),
      safePage,
      Math.min(totalPages, safePage + 1),
      totalPages,
    ]),
  ).sort((a, b) => a - b);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="ui-pagination flex flex-col gap-3 border-t border-gray-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-gray-500">
        <span>
          Mostrando <strong className="text-gray-900">{start}-{end}</strong> de{' '}
          <strong className="text-gray-900">{totalItems}</strong>
        </span>
        {!compact && onPageSizeChange && (
          <label className="inline-flex items-center gap-2">
            Filas
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-black text-gray-700 outline-none transition focus:border-store-red"
              aria-label="Filas por página"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-1.5" aria-label="Paginación">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-store-red hover:text-store-red disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Página anterior"
        >
          <ChevronLeft size={15} />
        </button>

        {visiblePages.map((pageNumber, index) => {
          const previous = visiblePages[index - 1];
          const showGap = index > 0 && previous !== undefined && pageNumber - previous > 1;

          return (
            <span key={pageNumber} className="contents">
              {showGap && <span className="px-1 text-xs text-gray-400">…</span>}
              <button
                type="button"
                onClick={() => onPageChange(pageNumber)}
                aria-current={pageNumber === safePage ? 'page' : undefined}
                className={
                  'h-9 min-w-9 rounded-lg border px-2 text-xs font-black transition ' +
                  (pageNumber === safePage
                    ? 'border-store-red bg-store-red text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-store-red hover:text-store-red')
                }
              >
                {pageNumber}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-store-red hover:text-store-red disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Página siguiente"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </motion.div>
  );
};

export default Pagination;
