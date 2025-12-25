import {
    PaginationParams,
    ValidatedPaginationParams,
    PaginationMetadata,
    PaginationOptions,
    PaginationValidationResult
} from '../types/pagination';

/**
 * Validates pagination parameters
 * @param params - Raw pagination parameters
 * @param options - Pagination validation options
 * @returns Validation result with validated parameters or errors
 */
export const validatePaginationParams = (
    params: Partial<PaginationParams>,
    options: PaginationOptions = {}
): PaginationValidationResult => {
    const errors: string[] = [];
    const { maxLimit = 100, defaultLimit = 10 } = options;

    // Validate page
    let page = 1;
    if (params.page !== undefined) {
        if (isNaN(params.page) || params.page < 1) {
            errors.push('Page must be a positive integer');
        } else {
            page = Math.floor(params.page);
        }
    }

    // Validate limit
    let limit = defaultLimit;
    if (params.limit !== undefined) {
        if (isNaN(params.limit) || params.limit < 1) {
            errors.push('Limit must be a positive integer');
        } else {
            limit = Math.min(Math.floor(params.limit), maxLimit);
        }
    }

    if (errors.length > 0) {
        return { isValid: false, errors };
    }

    const skip = (page - 1) * limit;

    return {
        isValid: true,
        params: { page, limit, skip }
    };
};

/**
 * Calculates pagination metadata
 * @param currentPage - Current page number
 * @param limit - Items per page
 * @param totalItems - Total number of items
 * @returns Pagination metadata
 */
export const calculatePaginationMetadata = (
    currentPage: number,
    limit: number,
    totalItems: number
): PaginationMetadata => {
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    return {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPreviousPage,
        nextPage: hasNextPage ? currentPage + 1 : undefined,
        previousPage: hasPreviousPage ? currentPage - 1 : undefined
    };
};

/**
 * Builds Prisma query parameters for pagination
 * @param params - Validated pagination parameters
 * @returns Prisma query parameters
 */
export const buildPrismaPaginationQuery = (params: ValidatedPaginationParams) => {
    return {
        skip: params.skip,
        take: params.limit
    };
};

/**
 * Creates a paginated response object
 * @param data - The data to paginate
 * @param pagination - Pagination metadata
 * @returns Paginated response
 */
export const createPaginatedResponse = <T>(
    data: T[],
    pagination: PaginationMetadata
) => {
    return {
        data,
        pagination
    };
};

/**
 * Gets pagination parameters from request query with validation
 * @param query - Request query object
 * @param options - Pagination options
 * @returns Validated pagination parameters
 */
export const getPaginationFromQuery = (
    query: any,
    options: PaginationOptions = {}
): ValidatedPaginationParams => {
    const page = query.page ? parseInt(query.page, 10) : undefined;
    const limit = query.limit ? parseInt(query.limit, 10) : undefined;

    const validation = validatePaginationParams({ page, limit }, options);

    if (!validation.isValid || !validation.params) {
        // Return default pagination if validation fails
        return {
            page: 1,
            limit: options.defaultLimit || 10,
            skip: 0
        };
    }

    return validation.params;
};