import React, { useState, useRef, useEffect } from 'react';
import { SortOrder } from '../../types';

export interface SortOption {
    value: string;
    label: string;
    field: string;
    order: SortOrder;
}

export interface CommentSortProps {
    options: SortOption[];
    value?: string;
    onChange: (option: SortOption) => void;
    disabled?: boolean;
    label?: string;
    className?: string;
}

const CommentSort: React.FC<CommentSortProps> = ({
    options,
    value,
    onChange,
    disabled = false,
    label = 'Sort by:',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<SortOption | null>(
        options.find(option => option.value === value) || options[0] || null
    );
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !buttonRef.current?.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                buttonRef.current?.focus();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen]);

    useEffect(() => {
        const currentOption = options.find(option => option.value === value);
        if (currentOption) {
            setSelectedOption(currentOption);
        }
    }, [value, options]);

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleSelectOption = (option: SortOption) => {
        setSelectedOption(option);
        onChange(option);
        setIsOpen(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setIsOpen(true);
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggle();
        }
    };

    const getSortIcon = (order: SortOrder) => {
        return order === 'asc' ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                <path d="M7 14l5-5 5 5z" />
            </svg>
        ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                <path d="M7 10l5 5 5-5z" />
            </svg>
        );
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-gray-600 whitespace-nowrap sm:hidden" id="comment-sort-label">
                    {label}
                </label>
            )}

            <div className="relative min-w-[180px] sm:min-w-[160px]">
                <button
                    ref={buttonRef}
                    className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed sm:px-3 sm:py-1.5 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 disabled:dark:bg-gray-800 disabled:dark:text-gray-500"
                    onClick={handleToggle}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    aria-labelledby="comment-sort-label"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    type="button"
                >
                    <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
                        {selectedOption?.label || 'Select sort option'}
                    </span>
                    <span className="flex items-center gap-1 ml-2 flex-shrink-0">
                        {selectedOption && getSortIcon(selectedOption.order)}
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M7 10l5 5 5-5z" />
                        </svg>
                    </span>
                </button>

                {isOpen && (
                    <div
                        ref={dropdownRef}
                        className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 dark:bg-gray-800 dark:border-gray-600"
                        role="listbox"
                        aria-labelledby="comment-sort-label"
                    >
                        {options.map((option, index) => (
                            <button
                                key={option.value}
                                className={`flex items-center justify-between w-full px-4 py-2 bg-transparent border-none text-left text-sm text-gray-700 transition-all duration-200 whitespace-nowrap overflow-hidden text-ellipsis hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:bg-blue-50 focus:text-blue-600 sm:px-3 sm:py-1.5 dark:text-gray-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 dark:focus:bg-blue-900/20 dark:focus:text-blue-400 ${selectedOption?.value === option.value
                                        ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/20 dark:text-blue-400'
                                        : ''
                                    }`}
                                onClick={() => handleSelectOption(option)}
                                role="option"
                                aria-selected={selectedOption?.value === option.value}
                                type="button"
                            >
                                <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{option.label}</span>
                                <span className="ml-2 flex-shrink-0">
                                    {getSortIcon(option.order)}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentSort;