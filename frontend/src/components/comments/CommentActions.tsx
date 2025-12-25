import React, { useState, useRef, useEffect } from 'react';

export interface CommentActionsProps {
    commentId: string;
    onEdit?: () => void;
    onDelete?: () => void;
    onReport?: () => void;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
    position?: 'top-right' | 'bottom-left';
}

const CommentActions: React.FC<CommentActionsProps> = ({
    commentId,
    onEdit,
    onDelete,
    onReport,
    disabled = false,
    size = 'medium',
    position = 'top-right'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
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

    const handleToggleMenu = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            // Focus management for menu items would go here
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggleMenu();
        }
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                className={`flex items-center justify-center bg-transparent border-none rounded-md p-1 cursor-pointer transition-all duration-300 text-secondary hover:bg-secondary/10 hover:text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${size === 'small' ? 'p-0.5' : size === 'large' ? 'p-2' : 'p-1'
                    } dark:text-gray-400 dark:hover:bg-gray-400/10 dark:hover:text-white`}
                onClick={handleToggleMenu}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                aria-label="Comment options"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                type="button"
            >
                <svg
                    className={`fill-current ${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-6 h-6' : 'w-5 h-5'
                        }`}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                >
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                </svg>
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className={`absolute bg-white border border-gray-200 rounded-md shadow-lg z-[1000] min-w-[150px] py-1 animate-[fadeInScale_0.2s_ease-out] ${position === 'top-right' ? 'top-full right-0 mt-1' : 'bottom-full left-0 mb-1'
                        } ${size === 'small' ? 'min-w-[120px]' : size === 'large' ? 'min-w-[180px] py-2' : ''
                        } dark:bg-gray-800 dark:border-gray-600`}
                    role="menu"
                    aria-labelledby={`comment-actions-label-${commentId}`}
                >
                    <div
                        id={`comment-actions-label-${commentId}`}
                        className="absolute w-1 h-1 p-0 m-[-1px] overflow-hidden clip-[rect(0,0,0,0)] whitespace-nowrap border-0"
                    >
                        Comment actions
                    </div>

                    {onEdit && (
                        <button
                            className={`flex items-center gap-2 w-full p-2 bg-transparent border-none text-left cursor-pointer transition-all duration-300 text-dark text-sm hover:bg-primary/10 hover:text-primary focus:outline-none active:bg-primary/20 dark:text-white dark:hover:bg-primary/20 ${size === 'small' ? 'p-1 text-xs' : size === 'large' ? 'p-3 text-base' : 'p-2 text-sm'
                                }`}
                            onClick={() => handleAction(onEdit)}
                            role="menuitem"
                            type="button"
                        >
                            <svg
                                className={`fill-current flex-shrink-0 ${size === 'small' ? 'w-3.5 h-3.5' : size === 'large' ? 'w-4.5 h-4.5' : 'w-4 h-4'
                                    }`}
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                            </svg>
                            Edit
                        </button>
                    )}

                    {onDelete && (
                        <button
                            className={`flex items-center gap-2 w-full p-2 bg-transparent border-none text-left cursor-pointer transition-all duration-300 text-danger text-sm hover:bg-danger/10 hover:text-danger focus:outline-none active:bg-danger/20 dark:text-red-400 dark:hover:bg-red-400/10 dark:hover:text-red-300 ${size === 'small' ? 'p-1 text-xs' : size === 'large' ? 'p-3 text-base' : 'p-2 text-sm'
                                }`}
                            onClick={() => handleAction(onDelete)}
                            role="menuitem"
                            type="button"
                        >
                            <svg
                                className={`fill-current flex-shrink-0 ${size === 'small' ? 'w-3.5 h-3.5' : size === 'large' ? 'w-4.5 h-4.5' : 'w-4 h-4'
                                    }`}
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                            Delete
                        </button>
                    )}

                    {onReport && (
                        <button
                            className={`flex items-center gap-2 w-full p-2 bg-transparent border-none text-left cursor-pointer transition-all duration-300 text-dark text-sm hover:bg-primary/10 hover:text-primary focus:outline-none active:bg-primary/20 dark:text-white dark:hover:bg-primary/20 ${size === 'small' ? 'p-1 text-xs' : size === 'large' ? 'p-3 text-base' : 'p-2 text-sm'
                                }`}
                            onClick={() => handleAction(onReport)}
                            role="menuitem"
                            type="button"
                        >
                            <svg
                                className={`fill-current flex-shrink-0 ${size === 'small' ? 'w-3.5 h-3.5' : size === 'large' ? 'w-4.5 h-4.5' : 'w-4 h-4'
                                    }`}
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                            Report
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentActions;