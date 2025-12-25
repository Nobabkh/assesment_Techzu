// Base pagination parameters
export interface PaginationParams {
    page: number;
    limit: number;
}

// Extended pagination parameters with validation
export interface ValidatedPaginationParams extends PaginationParams {
    skip: number;
}

// Pagination metadata
export interface PaginationMetadata {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage?: number;
    previousPage?: number;
}

// Paginated response interface
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMetadata;
}

// Pagination options for building queries
export interface PaginationOptions {
    page?: number;
    limit?: number;
    maxLimit?: number;
    defaultLimit?: number;
}

// Pagination validation result
export interface PaginationValidationResult {
    isValid: boolean;
    errors?: string[];
    params?: ValidatedPaginationParams;
}