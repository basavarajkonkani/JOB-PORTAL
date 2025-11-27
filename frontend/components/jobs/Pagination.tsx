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
    <div className="mt-12 mb-16">
      {/* Subtle top border for visual separation */}
      <div className="w-full h-px bg-gray-200/40 mb-12"></div>

      {/* Pagination Container - Perfectly Centered */}
      <div className="flex items-center justify-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="group flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 font-medium rounded-full border border-gray-200 hover:border-[#005DFF] hover:bg-[#005DFF] hover:text-white hover:scale-105 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 disabled:hover:shadow-none transition-all duration-200 ease-in-out shadow-sm"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-2">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-400 font-medium"
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
                  min-w-[44px] px-4 py-2.5 font-semibold rounded-full transition-all duration-200 ease-in-out shadow-sm
                  ${
                    isActive
                      ? 'bg-[#005DFF] text-white shadow-md hover:shadow-lg scale-105'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-[#4EA8FF] hover:bg-[#4EA8FF]/10 hover:text-[#005DFF] hover:scale-105 hover:shadow-md'
                  }
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
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
          className="group flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 font-medium rounded-full border border-gray-200 hover:border-[#005DFF] hover:bg-[#005DFF] hover:text-white hover:scale-105 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 disabled:hover:shadow-none transition-all duration-200 ease-in-out shadow-sm"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Page Info - Optional, shows current position */}
      <div className="text-center mt-4 text-sm text-gray-500 font-medium">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
