import { PaginationMetadata } from './pagination';
import { SortOrder } from './sorting';

// Base comment interface
export interface Comment {
    id: string;
    content: string;
    authorId: string;
    parentId?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Comment with author information
export interface CommentWithAuthor extends Comment {
    author: {
        id: string;
        username: string;
        name?: string;
    };
}

// Comment with author and reply count
export interface CommentWithDetails extends CommentWithAuthor {
    _count: {
        replies: number;
        likes: number;
    };
    likesCount?: number;
    dislikesCount?: number;
}

// Comment creation request
export interface CreateCommentRequest {
    content: string;
    parentId?: string;
}

// Comment update request
export interface UpdateCommentRequest {
    content: string;
}

// Comment response
export interface CommentResponse extends CommentWithDetails {
    // Additional fields if needed
}

// Comment list response with pagination
export interface CommentListResponse {
    comments: CommentResponse[];
    pagination: PaginationMetadata;
}

// Comment query parameters for pagination and sorting
export interface CommentQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string | string[];
    sortOrder?: SortOrder | SortOrder[];
    authorId?: string;
    parentId?: string;
    dateFrom?: string;
    dateTo?: string;
    specialSort?: 'mostLiked' | 'mostDisliked' | 'newest' | 'oldest';
}

// Extended comment query parameters for advanced filtering
export interface ExtendedCommentQueryParams extends CommentQueryParams {
    search?: string;
    minLikes?: number;
    maxLikes?: number;
    minReplies?: number;
    maxReplies?: number;
}

// Comment error response
export interface CommentErrorResponse {
    message: string;
    error?: string;
}

// Comment validation error response
export interface CommentValidationError extends CommentErrorResponse {
    errors: {
        field: string;
        message: string;
    }[];
}