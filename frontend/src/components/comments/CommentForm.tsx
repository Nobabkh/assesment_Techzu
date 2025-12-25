import React, { useState, useRef, useEffect } from 'react';
import { CommentResponse } from '../../types';
import { useWebSocket } from '../../hooks';
import { TypingIndicator } from '../index';

export interface CommentFormProps {
    onSubmit: (content: string) => void;
    onCancel?: () => void;
    initialContent?: string;
    placeholder?: string;
    submitButtonText?: string;
    cancelButtonText?: string;
    title?: string;
    maxLength?: number;
    disabled?: boolean;
    autoFocus?: boolean;
    showCancelButton?: boolean;
    isEditing?: boolean;
    editingComment?: CommentResponse | null;
}

const CommentForm: React.FC<CommentFormProps> = ({
    onSubmit,
    onCancel,
    initialContent = '',
    placeholder = 'Share your thoughts...',
    submitButtonText = 'Post Comment',
    cancelButtonText = 'Cancel',
    title,
    maxLength = 1000,
    disabled = false,
    autoFocus = false,
    showCancelButton = true,
    isEditing = false,
    editingComment = null
}) => {
    const [content, setContent] = useState(initialContent);
    const [isFocused, setIsFocused] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // WebSocket functionality
    const { startTyping, stopTyping, isConnected } = useWebSocket();

    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [autoFocus]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim() || disabled || isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(content.trim());
            setContent('');
        } catch (error) {
            // Error handling is managed by the parent component
            console.error('Error submitting comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setContent(initialContent);
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
    const canSubmit = content.trim().length > 0 && !isOverLimit && !disabled && !isSubmitting;

    const getFormTitle = () => {
        if (title) return title;
        if (isEditing && editingComment) {
            return `Editing comment by ${editingComment.author.username}`;
        }
        return 'Leave a Comment';
    };

    return (
        <div className={`bg-white rounded-xl border transition-all duration-200 ${isFocused
                ? 'border-blue-500 ring-2 ring-blue-500/20'
                : 'border-gray-200'
            } ${isEditing ? 'border-l-4 border-l-yellow-500' : ''} dark:bg-gray-800 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400/20`}>
            {/* Typing indicator */}
            {isConnected && isFocused && (
                <div className="px-4 pt-4 sm:px-3 sm:pt-3">
                    <TypingIndicator commentId="general" />
                </div>
            )}

            {getFormTitle() && (
                <div className="px-6 pt-4 pb-2 sm:px-4 sm:pt-3 sm:pb-1">
                    <h3 className="text-lg font-semibold text-gray-900 sm:text-base dark:text-white">
                        {getFormTitle()}
                    </h3>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-4">
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        className={`w-full p-4 border rounded-xl resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isOverLimit
                                ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300 focus:border-blue-500'
                            } ${disabled || isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''} sm:p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:border-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-gray-800`}
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            // Send typing indicator if connected and content is not empty
                            if (isConnected && e.target.value.trim()) {
                                startTyping('general');
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            setIsFocused(true);
                            // Start typing indicator when focused
                            if (isConnected && content.trim()) {
                                startTyping('general');
                            }
                        }}
                        onBlur={() => {
                            setIsFocused(false);
                            // Stop typing indicator when blurred
                            if (isConnected) {
                                stopTyping('general');
                            }
                        }}
                        placeholder={placeholder}
                        aria-label={placeholder}
                        maxLength={maxLength}
                        disabled={disabled || isSubmitting}
                        rows={4}
                        required
                    />

                    {maxLength && (
                        <div
                            className={`absolute bottom-3 right-3 text-sm font-medium ${isOverLimit
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

                <div className="flex justify-end gap-3 mt-4 sm:mt-3 sm:gap-2">
                    {showCancelButton && onCancel && (
                        <button
                            type="button"
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium sm:px-3 sm:py-1.5 sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            onClick={handleCancel}
                            disabled={disabled || isSubmitting}
                        >
                            {cancelButtonText}
                        </button>
                    )}

                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 sm:px-4 sm:py-1.5 sm:text-sm dark:bg-blue-600 dark:hover:bg-blue-700"
                        disabled={!canSubmit}
                        aria-disabled={!canSubmit}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
                                {isEditing ? 'Updating...' : 'Posting...'}
                            </>
                        ) : (
                            submitButtonText
                        )}
                    </button>
                </div>

                {isOverLimit && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400" role="alert">
                        Comment exceeds maximum character limit
                    </div>
                )}
            </form>
        </div>
    );
};

export default CommentForm;