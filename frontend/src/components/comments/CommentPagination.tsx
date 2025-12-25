import React from 'react';
import { PaginationMetadata } from '../../types';

export interface CommentPaginationProps {
    pagination: PaginationMetadata;
    onPageChange: (page: number) => void;
    disabled?: boolean;
    showPageNumbers?: boolean;
    maxVisiblePages?: number;
    className?: string;
    ariaLabel?: string;
}

const CommentPagination: React.FC<CommentPaginationProps> = ({
    pagination,
    onPageChange,
    disabled = false,
    showPageNumbers = true,
    maxVisiblePages = 5,
    className = '',
    ariaLabel = 'Comments pagination'
}) => {
    const { currentPage, totalPages, hasNextPage, hasPreviousPage } = pagination;

    if (totalPages <= 1) {
        return null;
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && !disabled) {
            onPageChange(page);
        }
    };

    const handlePrevious = () => {
        if (hasPreviousPage && !disabled) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (hasNextPage && !disabled) {
            handlePageChange(currentPage + 1);
        }
    };

    const handleFirst = () => {
        if (currentPage !== 1 && !disabled) {
            handlePageChange(1);
        }
    };

    const handleLast = () => {
        if (currentPage !== totalPages && !disabled) {
            handlePageChange(totalPages);
        }
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: number[] = [];
        const halfVisible = Math.floor(maxVisiblePages / 2);

        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();
    const showFirstEllipsis = pageNumbers[0] > 2;
    const showLastEllipsis = pageNumbers[pageNumbers.length - 1] < totalPages - 1;

    return (
        <nav
            className={`flex flex-col items-center gap-3 my-6 ${className}`}
            role="navigation"
            aria-label={ariaLabel}
        >
            <div className="text-sm text-gray-500 font-medium text-center dark:text-gray-400" aria-live="polite">
                Page {currentPage} of {totalPages}
            </div>

            <ul className="flex items-center gap-1 list-none m-0 p-0 sm:gap-0.5">
                {/* First page button */}
                <li className="m-0">
                    <button
                        className="flex items-center justify-center min-w-[40px] h-10 px-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed sm:min-w-[36px] sm:h-9 sm:text-xs dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 disabled:dark:bg-gray-800 disabled:dark:text-gray-500"
                        onClick={handleFirst}
                        disabled={disabled || currentPage === 1}
                        aria-label="Go to first page"
                        aria-disabled={disabled || currentPage === 1}
                        type="button"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current sm:w-4 sm:h-4" aria-hidden="true">
                            <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" />
                        </svg>
                    </button>
                </li>

                {/* Previous page button */}
                <li className="m-0">
                    <button
                        className="flex items-center justify-center min-w-[40px] h-10 px-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed sm:min-w-[36px] sm:h-9 sm:text-xs dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 disabled:dark:bg-gray-800 disabled:dark:text-gray-500"
                        onClick={handlePrevious}
                        disabled={disabled || !hasPreviousPage}
                        aria-label="Go to previous page"
                        aria-disabled={disabled || !hasPreviousPage}
                        type="button"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current sm:w-4 sm:h-4" aria-hidden="true">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                    </button>
                </li>

                {/* Page numbers */}
                {showPageNumbers && (
                    <>
                        {/* First page if not in range */}
                        {pageNumbers[0] > 1 && (
                            <li className="m-0">
                                <button
                                    className="flex items-center justify-center min-w-[40px] h-10 px-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed sm:min-w-[36px] sm:h-9 sm:text-xs dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 disabled:dark:bg-gray-800 disabled:dark:text-gray-500"
                                    onClick={() => handlePageChange(1)}
                                    disabled={disabled}
                                    aria-label={`Go to page 1`}
                                    aria-current={currentPage === 1 ? 'page' : undefined}
                                    type="button"
                                >
                                    1
                                </button>
                            </li>
                        )}

                        {/* First ellipsis */}
                        {showFirstEllipsis && (
                            <li className="m-0">
                                <span className="flex items-center justify-center min-w-[40px] h-10 px-2 text-gray-400 text-sm font-medium sm:min-w-[36px] sm:h-9 sm:text-xs dark:text-gray-500" aria-hidden="true">
                                    ...
                                </span>
                            </li>
                        )}

                        {/* Visible page numbers */}
                        {pageNumbers.map((page) => (
                            <li key={page} className="m-0">
                                <button
                                    className={`flex items-center justify-center min-w-[40px] h-10 px-2 bg-white border rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed sm:min-w-[36px] sm:h-9 sm:text-xs dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-blue-400/20 disabled:dark:bg-gray-800 disabled:dark:text-gray-500 ${currentPage === page
                                            ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:border-blue-600 dark:text-white dark:hover:bg-blue-700'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                                        }`}
                                    onClick={() => handlePageChange(page)}
                                    disabled={disabled}
                                    aria-label={`Go to page ${page}`}
                                    aria-current={currentPage === page ? 'page' : undefined}
                                    type="button"
                                >
                                    {page}
                                </button>
                            </li>
                        ))}

                        {/* Last ellipsis */}
                        {showLastEllipsis && (
                            <li className="m-0">
                                <span className="flex items-center justify-center min-w-[40px] h-10 px-2 text-gray-400 text-sm font-medium sm:min-w-[36px] sm:h-9 sm:text-xs dark:text-gray-500" aria-hidden="true">
                                    ...
                                </span>
                            </li>
                        )}

                        {/* Last page if not in range */}
                        {pageNumbers[pageNumbers.length - 1] < totalPages && (
                            <li className="m-0">
                                <button
                                    className="flex items-center justify-center min-w-[40px] h-10 px-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed sm:min-w-[36px] sm:h-9 sm:text-xs dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 disabled:dark:bg-gray-800 disabled:dark:text-gray-500"
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={disabled}
                                    aria-label={`Go to page ${totalPages}`}
                                    aria-current={currentPage === totalPages ? 'page' : undefined}
                                    type="button"
                                >
                                    {totalPages}
                                </button>
                            </li>
                        )}
                    </>
                )}

                {/* Next page button */}
                <li className="m-0">
                    <button
                        className="flex items-center justify-center min-w-[40px] h-10 px-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed sm:min-w-[36px] sm:h-9 sm:text-xs dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 disabled:dark:bg-gray-800 disabled:dark:text-gray-500"
                        onClick={handleNext}
                        disabled={disabled || !hasNextPage}
                        aria-label="Go to next page"
                        aria-disabled={disabled || !hasNextPage}
                        type="button"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current sm:w-4 sm:h-4" aria-hidden="true">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                    </button>
                </li>

                {/* Last page button */}
                <li className="m-0">
                    <button
                        className="flex items-center justify-center min-w-[40px] h-10 px-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed sm:min-w-[36px] sm:h-9 sm:text-xs dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 disabled:dark:bg-gray-800 disabled:dark:text-gray-500"
                        onClick={handleLast}
                        disabled={disabled || currentPage === totalPages}
                        aria-label="Go to last page"
                        aria-disabled={disabled || currentPage === totalPages}
                        type="button"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current sm:w-4 sm:h-4" aria-hidden="true">
                            <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" />
                        </svg>
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default CommentPagination;