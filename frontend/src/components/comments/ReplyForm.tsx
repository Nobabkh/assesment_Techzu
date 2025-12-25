import React, { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import TypingIndicator from '../TypingIndicator';

export interface ReplyFormProps {
    onSubmit: (content: string) => void;
    onCancel?: () => void;
    placeholder?: string;
    ariaLabel?: string;
    maxLength?: number;
    disabled?: boolean;
    autoFocus?: boolean;
    showCancelButton?: boolean;
    submitButtonText?: string;
    cancelButtonText?: string;
    commentId?: string; // For reply-specific typing indicators
}

const ReplyForm: React.FC<ReplyFormProps> = ({
    onSubmit,
    onCancel,
    placeholder = 'Write a reply...',
    ariaLabel,
    maxLength = 1000,
    disabled = false,
    autoFocus = false,
    showCancelButton = true,
    submitButtonText = 'Reply',
    cancelButtonText = 'Cancel',
    commentId
}) => {
    const [content, setContent] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // WebSocket hooks for typing indicators
    const { startTyping, stopTyping } = useWebSocket();

    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [autoFocus]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim() || disabled) {
            return;
        }

        onSubmit(content.trim());
        setContent('');
    };

    const handleCancel = () => {
        setContent('');
        if (onCancel) {
            onCancel();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Submit on Ctrl/Cmd + Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(e);
        }

        // Cancel on Escape
        if (e.key === 'Escape' && onCancel) {
            e.preventDefault();
            handleCancel();
        }
    };

    const characterCount = content.length;
    const isOverLimit = characterCount > maxLength;
    const isNearLimit = characterCount > maxLength * 0.9;
    const canSubmit = content.trim().length > 0 && !isOverLimit && !disabled;

    return (
        <form
            className={`bg-gray-50 rounded-xl border transition-all duration-200 ${isFocused
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-gray-200'
                } dark:bg-gray-800/50 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400/20`}
            onSubmit={handleSubmit}
            noValidate
        >
            <div className="p-4 sm:p-3">
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        className={`w-full min-h-[80px] p-3 border rounded-xl resize-y transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isOverLimit
                                ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-500'
                            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} sm:p-2.5 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:border-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-gray-800`}
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            // Emit typing event if there's content
                            if (e.target.value.trim() && commentId) {
                                startTyping(commentId);
                            } else if (commentId) {
                                stopTyping(commentId);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            setIsFocused(true);
                            // Emit typing event when focused
                            if (content.trim() && commentId) {
                                startTyping(commentId);
                            }
                        }}
                        onBlur={() => {
                            setIsFocused(false);
                            // Stop typing when blurred
                            if (commentId) {
                                stopTyping(commentId);
                            }
                        }}
                        placeholder={placeholder}
                        aria-label={ariaLabel || placeholder}
                        maxLength={maxLength}
                        disabled={disabled}
                        rows={3}
                        required
                    />

                    {maxLength && (
                        <div
                            className={`absolute bottom-2 right-2 text-xs font-medium ${isOverLimit
                                    ? 'text-red-600'
                                    : isNearLimit
                                        ? 'text-yellow-600'
                                        : 'text-gray-400'
                                } dark:text-gray-500`}
                            aria-live="polite"
                        >
                            {characterCount}/{maxLength}
                        </div>
                    )}
                </div>

                {/* Typing indicator for replies */}
                {commentId && (
                    <div className="mb-3 min-h-[24px]">
                        <TypingIndicator commentId={commentId} />
                    </div>
                )}

                <div className="flex justify-end gap-2 sm:flex-col sm:gap-1.5">
                    {showCancelButton && onCancel && (
                        <button
                            type="button"
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:px-3 sm:py-1.5 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            onClick={handleCancel}
                            disabled={disabled}
                        >
                            {cancelButtonText}
                        </button>
                    )}

                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed font-medium text-sm sm:px-3 sm:py-1.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-blue-800"
                        disabled={!canSubmit}
                        aria-disabled={!canSubmit}
                    >
                        {submitButtonText}
                    </button>
                </div>

                {isOverLimit && (
                    <div className="mt-2 text-red-600 text-sm font-medium dark:text-red-400" role="alert">
                        Reply exceeds maximum character limit
                    </div>
                )}
            </div>
        </form>
    );
};

export default ReplyForm;