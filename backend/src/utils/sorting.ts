import {
    SortOrder,
    SortParam,
    SortingParams,
    ValidatedSortingParams,
    SortingOptions,
    SortingValidationResult
} from '../types/sorting';

/**
 * Validates sorting parameters
 * @param params - Raw sorting parameters
 * @param options - Sorting validation options
 * @returns Validation result with validated parameters or errors
 */
export const validateSortingParams = (
    params: SortingParams,
    options: SortingOptions = {}
): SortingValidationResult => {
    const errors: string[] = [];
    const {
        allowedFields = [],
        defaultSortBy = ['createdAt'],
        defaultSortOrder = ['desc']
    } = options;

    let sortBy: string[] = [];
    let sortOrder: SortOrder[] = [];

    // Handle sortBy parameter
    if (params.sortBy) {
        if (typeof params.sortBy === 'string') {
            sortBy = params.sortBy.split(',').map(s => s.trim());
        } else if (Array.isArray(params.sortBy)) {
            sortBy = params.sortBy;
        }
    } else {
        sortBy = defaultSortBy;
    }

    // Handle sortOrder parameter
    if (params.sortOrder) {
        if (typeof params.sortOrder === 'string') {
            sortOrder = params.sortOrder.split(',').map(s => s.trim() as SortOrder);
        } else if (Array.isArray(params.sortOrder)) {
            sortOrder = params.sortOrder as SortOrder[];
        }
    } else {
        sortOrder = defaultSortOrder;
    }

    // Validate sort fields
    if (allowedFields.length > 0) {
        sortBy.forEach(field => {
            if (!allowedFields.includes(field)) {
                errors.push(`Invalid sort field: ${field}. Allowed fields: ${allowedFields.join(', ')}`);
            }
        });
    }

    // Validate sort orders
    sortOrder.forEach(order => {
        if (order !== 'asc' && order !== 'desc') {
            errors.push(`Invalid sort order: ${order}. Must be 'asc' or 'desc'`);
        }
    });

    // Ensure sortBy and sortOrder arrays have the same length
    if (sortBy.length !== sortOrder.length) {
        // If sortOrder is shorter, extend it with the last value or default
        while (sortOrder.length < sortBy.length) {
            sortOrder.push(sortOrder.length > 0 ? sortOrder[sortOrder.length - 1] : defaultSortOrder[0]);
        }
        // If sortBy is shorter, truncate sortOrder
        if (sortOrder.length > sortBy.length) {
            sortOrder = sortOrder.slice(0, sortBy.length);
        }
    }

    if (errors.length > 0) {
        return { isValid: false, errors };
    }

    return {
        isValid: true,
        params: { sortBy, sortOrder }
    };
};

/**
 * Builds Prisma orderBy parameter from sorting parameters
 * @param params - Validated sorting parameters
 * @returns Prisma orderBy parameter
 */
export const buildPrismaSortingQuery = (params: ValidatedSortingParams) => {
    const orderBy: any = {};

    params.sortBy.forEach((field, index) => {
        orderBy[field] = params.sortOrder[index];
    });

    return orderBy;
};

/**
 * Creates a single sort parameter object
 * @param field - Field name
 * @param order - Sort order
 * @returns Sort parameter object
 */
export const createSortParam = (field: string, order: SortOrder = 'desc'): SortParam => {
    return { field, order };
};

/**
 * Gets sorting parameters from request query with validation
 * @param query - Request query object
 * @param options - Sorting options
 * @returns Validated sorting parameters
 */
export const getSortingFromQuery = (
    query: any,
    options: SortingOptions = {}
): ValidatedSortingParams => {
    const sortBy = query.sortBy;
    const sortOrder = query.sortOrder;

    const validation = validateSortingParams({ sortBy, sortOrder }, options);

    if (!validation.isValid || !validation.params) {
        // Return default sorting if validation fails
        return {
            sortBy: options.defaultSortBy || ['createdAt'],
            sortOrder: options.defaultSortOrder || ['desc']
        };
    }

    return validation.params;
};

/**
 * Creates sorting configuration for comments
 * @returns Sorting configuration for comments
 */
export const createCommentSortingConfig = (): SortingOptions => {
    return {
        allowedFields: [
            'createdAt',
            'updatedAt',
            'content',
            'likesCount',
            'dislikesCount',
            'repliesCount'
        ],
        defaultSortBy: ['createdAt'],
        defaultSortOrder: ['desc']
    };
};

/**
 * Handles special sorting cases like "most liked" or "most disliked"
 * @param sortType - Special sort type
 * @returns Sorting parameters for the special case
 */
export const handleSpecialSorting = (sortType: string): ValidatedSortingParams => {
    switch (sortType) {
        case 'mostLiked':
            return {
                sortBy: ['likesCount'],
                sortOrder: ['desc']
            };
        case 'mostDisliked':
            return {
                sortBy: ['dislikesCount'],
                sortOrder: ['desc']
            };
        case 'newest':
            return {
                sortBy: ['createdAt'],
                sortOrder: ['desc']
            };
        case 'oldest':
            return {
                sortBy: ['createdAt'],
                sortOrder: ['asc']
            };
        default:
            return {
                sortBy: ['createdAt'],
                sortOrder: ['desc']
            };
    }
};