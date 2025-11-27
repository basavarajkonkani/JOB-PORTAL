'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // Maximum number of page buttons to show

    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 2; i <= Math.min(4, totalPages - 1); i++) {
          pages.push(i);
        }
        pages.push('...');
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('...');
        for (let i = Math.max(totalPages - 3, 2); i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="mt-10 mb-8" aria-label="Pagination">
      {/* Subtle top border for visual separation */}
      <div className="w-full h-px bg-[#E5E7EB] mb-8"></div>

      {/* Pagination Container - Perfectly Centered */}
      <div className="flex items-center justify-center gap-1.5">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="group flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#374151] text-[14px] font-medium rounded-lg border border-[#E5E7EB] hover:border-[#2563EB] hover:bg-[#2563EB] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#374151] disabled:hover:border-[#E5E7EB] transition-all duration-200"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1.5">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-2 text-[#9CA3AF] text-[14px] font-medium"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
                className={`
                  min-w-[40px] px-3 py-2 text-[14px] font-semibold rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-white text-[#374151] border border-[#E5E7EB] hover:border-[#2563EB] hover:text-[#2563EB]'
                  }
                  disabled:opacity-40 disabled:cursor-not-allowed
                `}
                aria-label={`Go to page ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="group flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#374151] text-[14px] font-medium rounded-lg border border-[#E5E7EB] hover:border-[#2563EB] hover:bg-[#2563EB] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#374151] disabled:hover:border-[#E5E7EB] transition-all duration-200"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Page Info */}
      <div className="text-center mt-3 text-[13px] text-[#6F6F6F] font-medium">
        Page {currentPage} of {totalPages}
      </div>
    </nav>
  );
}
