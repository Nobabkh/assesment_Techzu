import React, { useState, useRef, useEffect } from 'react';
import { ExtendedCommentQueryParams } from '../../types';

export interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

export interface CommentFiltersProps {
    onFiltersChange: (filters: ExtendedCommentQueryParams) => void;
    initialFilters?: ExtendedCommentQueryParams;
    authorOptions?: FilterOption[];
    disabled?: boolean;
    className?: string;
}

const CommentFilters: React.FC<CommentFiltersProps> = ({
    onFiltersChange,
    initialFilters = {},
    authorOptions = [],
    disabled = false,
    className = ''
}) => {
    const [filters, setFilters] = useState<ExtendedCommentQueryParams>(initialFilters);
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [selectedAuthor, setSelectedAuthor] = useState(initialFilters.authorId || '');
    const [minLikes, setMinLikes] = useState(initialFilters.minLikes?.toString() || '');
    const [maxLikes, setMaxLikes] = useState(initialFilters.maxLikes?.toString() || '');
    const [minReplies, setMinReplies] = useState(initialFilters.minReplies?.toString() || '');
    const [maxReplies, setMaxReplies] = useState(initialFilters.maxReplies?.toString() || '');
    const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom || '');
    const [dateTo, setDateTo] = useState(initialFilters.dateTo || '');

    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    const applyFilters = () => {
        const newFilters: ExtendedCommentQueryParams = {
            ...filters,
            search: searchTerm.trim() || undefined,
            authorId: selectedAuthor || undefined,
            minLikes: minLikes ? parseInt(minLikes, 10) : undefined,
            maxLikes: maxLikes ? parseInt(maxLikes, 10) : undefined,
            minReplies: minReplies ? parseInt(minReplies, 10) : undefined,
            maxReplies: maxReplies ? parseInt(maxReplies, 10) : undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined
        };

        // Remove undefined values
        Object.keys(newFilters).forEach(key => {
            if (newFilters[key as keyof ExtendedCommentQueryParams] === undefined) {
                delete newFilters[key as keyof ExtendedCommentQueryParams];
            }
        });

        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedAuthor('');
        setMinLikes('');
        setMaxLikes('');
        setMinReplies('');
        setMaxReplies('');
        setDateFrom('');
        setDateTo('');

        const clearedFilters: ExtendedCommentQueryParams = {};
        setFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    };

    const handleToggleExpanded = () => {
        if (!disabled) {
            setIsExpanded(!isExpanded);
        }
    };

    const hasActiveFilters = !!(
        searchTerm ||
        selectedAuthor ||
        minLikes ||
        maxLikes ||
        minReplies ||
        maxReplies ||
        dateFrom ||
        dateTo
    );

    const getActiveFilterCount = () => {
        let count = 0;
        if (searchTerm) count++;
        if (selectedAuthor) count++;
        if (minLikes) count++;
        if (maxLikes) count++;
        if (minReplies) count++;
        if (maxReplies) count++;
        if (dateFrom) count++;
        if (dateTo) count++;
        return count;
    };

    return (
        <div
            ref={filterRef}
            className={`relative ${className}`}
        >
            <button
                className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${hasActiveFilters
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-gray-200 text-gray-600'
                    } dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-blue-400`}
                onClick={handleToggleExpanded}
                disabled={disabled}
                aria-expanded={isExpanded}
                aria-controls="comment-filters-panel"
                type="button"
            >
                <svg
                    className="w-5 h-5 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v2zm0-8v2h8v-2h-8v2zM3 9v2h6V9H3zm16 0v2h2V9h-2zm-2-4v2h2V5h-2z" />
                </svg>
                <span>Filters</span>
                {hasActiveFilters && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 bg-blue-600 text-white rounded-full text-xs font-semibold leading-none dark:bg-blue-500">
                        {getActiveFilterCount()}
                    </span>
                )}
                <svg
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M7 10l5 5 5-5z" />
                </svg>
            </button>

            {isExpanded && (
                <div id="comment-filters-panel" className="absolute top-full right-0 z-50 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200 sm:w-72 dark:bg-gray-800 dark:border-gray-600">
                    <div className="mb-4">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="comment-search">
                            Search
                        </label>
                        <div className="relative">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                id="comment-search"
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search comments..."
                                disabled={disabled}
                            />
                        </div>
                    </div>

                    {authorOptions.length > 0 && (
                        <div className="mb-4">
                            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="author-filter">
                                Author
                            </label>
                            <select
                                id="author-filter"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                                value={selectedAuthor}
                                onChange={(e) => setSelectedAuthor(e.target.value)}
                                disabled={disabled}
                            >
                                <option value="">All authors</option>
                                {authorOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                        {option.count !== undefined && ` (${option.count})`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="min-likes">
                                Min Likes
                            </label>
                            <input
                                id="min-likes"
                                type="number"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                                value={minLikes}
                                onChange={(e) => setMinLikes(e.target.value)}
                                placeholder="0"
                                min="0"
                                disabled={disabled}
                            />
                        </div>

                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="max-likes">
                                Max Likes
                            </label>
                            <input
                                id="max-likes"
                                type="number"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                                value={maxLikes}
                                onChange={(e) => setMaxLikes(e.target.value)}
                                placeholder="100"
                                min="0"
                                disabled={disabled}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="min-replies">
                                Min Replies
                            </label>
                            <input
                                id="min-replies"
                                type="number"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                                value={minReplies}
                                onChange={(e) => setMinReplies(e.target.value)}
                                placeholder="0"
                                min="0"
                                disabled={disabled}
                            />
                        </div>

                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="max-replies">
                                Max Replies
                            </label>
                            <input
                                id="max-replies"
                                type="number"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                                value={maxReplies}
                                onChange={(e) => setMaxReplies(e.target.value)}
                                placeholder="50"
                                min="0"
                                disabled={disabled}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="date-from">
                                Date From
                            </label>
                            <input
                                id="date-from"
                                type="date"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                disabled={disabled}
                            />
                        </div>

                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="date-to">
                                Date To
                            </label>
                            <input
                                id="date-to"
                                type="date"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                disabled={disabled}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <button
                            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-blue-400"
                            onClick={clearFilters}
                            disabled={disabled || !hasActiveFilters}
                            type="button"
                        >
                            Clear All
                        </button>
                        <button
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-400"
                            onClick={applyFilters}
                            disabled={disabled}
                            type="button"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentFilters;