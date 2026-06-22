import React from 'react';
import { HiChevronLeft, HiChevronRight, HiOutlineSearch } from 'react-icons/hi';

const DataTable = ({ 
  columns, 
  data, 
  loading, 
  page, 
  totalPages, 
  onPageChange,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search..."
}) => {
  return (
    <div className="glass-card overflow-hidden flex flex-col">
      {/* Toolbar */}
      {onSearchChange && (
        <div className="p-4 border-b border-dark-border flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <HiOutlineSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="form-input pl-10"
              placeholder={searchPlaceholder}
            />
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left text-[#0f1111]">
          <thead className="text-xs text-[#565959] uppercase bg-[#f3f3f3] border-b border-dark-border">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} scope="col" className="px-6 py-4 font-bold tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {loading ? (
              // Loading Skeleton
              [...Array(5)].map((_, idx) => (
                <tr key={idx} className="animate-pulse bg-white">
                  {columns.map((_, colIdx) => (
                    <td key={colIdx} className="px-6 py-4">
                      <div className="h-4 bg-[#f3f3f3] rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data && data.length > 0 ? (
              // Data Rows
              data.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-[#f8f9fa] transition-colors bg-white">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              // Empty State
              <tr className="bg-white">
                <td colSpan={columns.length} className="px-6 py-12 text-center text-[#565959]">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-dark-border flex items-center justify-between bg-[#f8f9fa]">
          <span className="text-sm text-[#565959]">
            Page <span className="font-bold text-[#0f1111]">{page}</span> of <span className="font-bold text-[#0f1111]">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1 || loading}
              className="p-2 rounded-md border border-dark-border bg-white text-[#0f1111] hover:bg-[#f3f3f3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <HiChevronLeft className="text-lg" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages || loading}
              className="p-2 rounded-md border border-dark-border bg-white text-[#0f1111] hover:bg-[#f3f3f3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <HiChevronRight className="text-lg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
