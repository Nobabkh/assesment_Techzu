import React, { useState, useEffect } from 'react';

export interface LikeButtonProps {
    likeCount: number;
    dislikeCount: number;
    userLikeStatus: 'like' | 'dislike' | null;
    onLike: () => void;
    onDislike: () => void;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
    ariaLabel?: string;
    showLabels?: boolean;
    hasRealtimeUpdate?: boolean; // For visual feedback on real-time updates
}

const LikeButton: React.FC<LikeButtonProps> = ({
    likeCount,
    dislikeCount,
    userLikeStatus,
    onLike,
    onDislike,
    disabled = false,
    size = 'medium',
    ariaLabel,
    showLabels = true,
    hasRealtimeUpdate = false
}) => {
    const [isHovering, setIsHovering] = useState<'like' | 'dislike' | null>(null);
    const [prevLikeCount, setPrevLikeCount] = useState(likeCount);
    const [prevDislikeCount, setPrevDislikeCount] = useState(dislikeCount);
    const [likeCountChanged, setLikeCountChanged] = useState(false);
    const [dislikeCountChanged, setDislikeCountChanged] = useState(false);

    // Detect changes in like counts for real-time updates
    useEffect(() => {
        if (likeCount !== prevLikeCount) {
            setLikeCountChanged(true);
            setPrevLikeCount(likeCount);

            // Reset the animation after a delay
            const timer = setTimeout(() => {
                setLikeCountChanged(false);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [likeCount, prevLikeCount]);

    useEffect(() => {
        if (dislikeCount !== prevDislikeCount) {
            setDislikeCountChanged(true);
            setPrevDislikeCount(dislikeCount);

            // Reset the animation after a delay
            const timer = setTimeout(() => {
                setDislikeCountChanged(false);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [dislikeCount, prevDislikeCount]);

    const handleLikeClick = () => {
        if (!disabled) {
            onLike();
        }
    };

    const handleDislikeClick = () => {
        if (!disabled) {
            onDislike();
        }
    };

    const getAriaLabel = () => {
        if (ariaLabel) return ariaLabel;

        if (userLikeStatus === 'like') {
            return `Liked (${likeCount} likes, ${dislikeCount} dislikes)`;
        } else if (userLikeStatus === 'dislike') {
            return `Disliked (${likeCount} likes, ${dislikeCount} dislikes)`;
        } else {
            return `Like or dislike (${likeCount} likes, ${dislikeCount} dislikes)`;
        }
    };

    const getLikeButtonLabel = () => {
        if (userLikeStatus === 'like') {
            return 'Liked';
        } else if (isHovering === 'like') {
            return 'Like';
        }
        return '';
    };

    const getDislikeButtonLabel = () => {
        if (userLikeStatus === 'dislike') {
            return 'Disliked';
        } else if (isHovering === 'dislike') {
            return 'Dislike';
        }
        return '';
    };

    // Size configurations
    const sizeClasses = {
        small: {
            container: 'gap-1',
            button: 'px-2 py-1 text-xs',
            icon: 'w-4 h-4',
            count: 'text-xs'
        },
        medium: {
            container: 'gap-2',
            button: 'px-3 py-1.5 text-sm',
            icon: 'w-5 h-5',
            count: 'text-sm'
        },
        large: {
            container: 'gap-3',
            button: 'px-4 py-2 text-base',
            icon: 'w-6 h-6',
            count: 'text-base'
        }
    };

    const currentSize = sizeClasses[size];

    return (
        <div
            className={`flex items-center ${currentSize.container} ${hasRealtimeUpdate ? 'animate-pulse' : ''}`}
            aria-label={getAriaLabel()}
        >
            <button
                className={`flex items-center gap-1.5 rounded-lg border transition-all duration-200 ${userLikeStatus === 'like'
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                    } ${currentSize.button} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500 ${userLikeStatus === 'like' ? 'dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' : ''} ${likeCountChanged ? 'scale-110' : ''}`}
                onClick={handleLikeClick}
                disabled={disabled}
                onMouseEnter={() => setIsHovering('like')}
                onMouseLeave={() => setIsHovering(null)}
                aria-label={userLikeStatus === 'like' ? 'Remove like' : 'Like this comment'}
                aria-pressed={userLikeStatus === 'like'}
                type="button"
            >
                <svg
                    className={`${currentSize.icon} flex-shrink-0`}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path
                        d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                        fill={userLikeStatus === 'like' ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span className={`font-medium ${currentSize.count} ${likeCountChanged ? 'text-red-600' : ''}`}>
                    {likeCount}
                </span>
                {showLabels && size !== 'small' && (
                    <span className="hidden sm:inline">{getLikeButtonLabel()}</span>
                )}
            </button>

            <button
                className={`flex items-center gap-1.5 rounded-lg border transition-all duration-200 ${userLikeStatus === 'dislike'
                    ? 'bg-gray-100 border-gray-300 text-gray-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                    } ${currentSize.button} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500 ${userLikeStatus === 'dislike' ? 'dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200' : ''} ${dislikeCountChanged ? 'scale-110' : ''}`}
                onClick={handleDislikeClick}
                disabled={disabled}
                onMouseEnter={() => setIsHovering('dislike')}
                onMouseLeave={() => setIsHovering(null)}
                aria-label={userLikeStatus === 'dislike' ? 'Remove dislike' : 'Dislike this comment'}
                aria-pressed={userLikeStatus === 'dislike'}
                type="button"
            >
                <svg
                    className={`${currentSize.icon} flex-shrink-0`}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path
                        d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"
                        fill={userLikeStatus === 'dislike' ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span className={`font-medium ${currentSize.count} ${dislikeCountChanged ? 'text-gray-700' : ''}`}>
                    {dislikeCount}
                </span>
                {showLabels && size !== 'small' && (
                    <span className="hidden sm:inline">{getDislikeButtonLabel()}</span>
                )}
            </button>
        </div>
    );
};

export default LikeButton;