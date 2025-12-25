// Base like interface
export interface Like {
    id: string;
    userId: string;
    commentId?: string;
    replyId?: string;
    type: 'like' | 'dislike';
    createdAt: Date;
}

// Like with user information
export interface LikeWithUser extends Like {
    user: {
        id: string;
        username: string;
        name?: string;
    };
}

// Like status for a user
export interface LikeStatus {
    hasLiked: boolean;
    hasDisliked: boolean;
}

// Like counts for a comment or reply
export interface LikeCounts {
    likesCount: number;
    dislikesCount: number;
    userLikeStatus?: LikeStatus;
}

// Like operation request
export interface LikeRequest {
    type: 'like' | 'dislike';
}

// Like response
export interface LikeResponse {
    message: string;
    data: {
        like?: LikeWithUser;
        counts: LikeCounts;
    };
}

// Like operation result with counts
export interface LikeWithCounts {
    like: LikeWithUser;
    counts: LikeCounts;
}

// Like status response
export interface LikeStatusResponse {
    message: string;
    data: LikeStatus;
}

// Like query parameters
export interface LikeQueryParams {
    commentId?: string;
    replyId?: string;
    userId?: string;
    type?: 'like' | 'dislike';
}

// Like error response
export interface LikeErrorResponse {
    message: string;
    error?: string;
}

// Like validation error response
export interface LikeValidationError extends LikeErrorResponse {
    errors: {
        field: string;
        message: string;
    }[];
}