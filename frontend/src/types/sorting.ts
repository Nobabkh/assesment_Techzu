// Sort order options
export type SortOrder = 'asc' | 'desc';

// Sorting parameter interface
export interface SortParam {
    field: string;
    order: SortOrder;
}

// Multiple sorting parameters
export interface SortingParams {
    sortBy?: string | string[];
    sortOrder?: SortOrder | SortOrder[];
}

// Validated sorting parameters
export interface ValidatedSortingParams {
    sortBy: string[];
    sortOrder: SortOrder[];
}

// Sorting options for validation
export interface SortingOptions {
    allowedFields?: string[];
    defaultSortBy?: string[];
    defaultSortOrder?: SortOrder[];
}

// Sorting validation result
export interface SortingValidationResult {
    isValid: boolean;
    errors?: string[];
    params?: ValidatedSortingParams;
}

// Sorting configuration for different entities
export interface SortingConfig {
    [key: string]: SortingOptions;
}