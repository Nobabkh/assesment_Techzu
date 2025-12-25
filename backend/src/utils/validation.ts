import { Request } from 'express';
import { PaginationValidationResult } from '../types/pagination';
import { SortingValidationResult } from '../types/sorting';

/**
 * Validates date range parameters
 * @param dateFrom - Start date string
 * @param dateTo - End date string
 * @returns Validation result with errors if any
 */
export const validateDateRange = (dateFrom?: string, dateTo?: string): { isValid: boolean; errors?: string[] } => {
    const errors: string[] = [];

    if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (isNaN(fromDate.getTime())) {
            errors.push('Invalid dateFrom format. Please use ISO date format.');
        }
    }

    if (dateTo) {
        const toDate = new Date(dateTo);
        if (isNaN(toDate.getTime())) {
            errors.push('Invalid dateTo format. Please use ISO date format.');
        }
    }

    if (dateFrom && dateTo) {
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);

        if (fromDate > toDate) {
            errors.push('dateFrom must be before or equal to dateTo.');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
    };
};

/**
 * Validates numeric range parameters
 * @param value - Value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param fieldName - Field name for error messages
 * @returns Validation result with errors if any
 */
export const validateNumericRange = (
    value?: string,
    min?: number,
    max?: number,
    fieldName?: string
): { isValid: boolean; errors?: string[]; parsedValue?: number } => {
    const errors: string[] = [];
    const name = fieldName || 'value';

    if (value !== undefined) {
        const numValue = parseInt(value, 10);

        if (isNaN(numValue)) {
            errors.push(`${name} must be a valid number.`);
        } else {
            if (min !== undefined && numValue < min) {
                errors.push(`${name} must be at least ${min}.`);
            }

            if (max !== undefined && numValue > max) {
                errors.push(`${name} must be at most ${max}.`);
            }

            return {
                isValid: errors.length === 0,
                errors: errors.length > 0 ? errors : undefined,
                parsedValue: numValue
            };
        }
    }

    return { isValid: true };
};

/**
 * Validates string parameters
 * @param value - String value to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @param fieldName - Field name for error messages
 * @returns Validation result with errors if any
 */
export const validateString = (
    value?: string,
    minLength?: number,
    maxLength?: number,
    fieldName?: string
): { isValid: boolean; errors?: string[] } => {
    const errors: string[] = [];
    const name = fieldName || 'value';

    if (value !== undefined) {
        if (typeof value !== 'string') {
            errors.push(`${name} must be a string.`);
        } else {
            if (minLength !== undefined && value.length < minLength) {
                errors.push(`${name} must be at least ${minLength} characters long.`);
            }

            if (maxLength !== undefined && value.length > maxLength) {
                errors.push(`${name} must be at most ${maxLength} characters long.`);
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
    };
};

/**
 * Validates MongoDB ObjectId format
 * @param id - ID string to validate
 * @param fieldName - Field name for error messages
 * @returns Validation result with errors if any
 */
export const validateObjectId = (id?: string, fieldName?: string): { isValid: boolean; errors?: string[] } => {
    const errors: string[] = [];
    const name = fieldName || 'id';

    if (id !== undefined) {
        // Basic ObjectId validation (24-character hex string)
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(id)) {
            errors.push(`${name} must be a valid ObjectId.`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
    };
};

/**
 * Validates all comment query parameters
 * @param query - Request query object
 * @returns Combined validation result
 */
export const validateCommentQueryParams = (query: any): {
    isValid: boolean;
    errors?: string[];
    pagination?: any;
    sorting?: any;
} => {
    const allErrors: string[] = [];
    let pagination;
    let sorting;

    // Validate date range
    const dateValidation = validateDateRange(query.dateFrom, query.dateTo);
    if (!dateValidation.isValid && dateValidation.errors) {
        allErrors.push(...dateValidation.errors);
    }

    // Validate authorId
    const authorIdValidation = validateObjectId(query.authorId, 'authorId');
    if (!authorIdValidation.isValid && authorIdValidation.errors) {
        allErrors.push(...authorIdValidation.errors);
    }

    // Validate parentId
    const parentIdValidation = validateObjectId(query.parentId, 'parentId');
    if (!parentIdValidation.isValid && parentIdValidation.errors) {
        allErrors.push(...parentIdValidation.errors);
    }

    // Validate minLikes and maxLikes
    const minLikesValidation = validateNumericRange(query.minLikes, 0, undefined, 'minLikes');
    if (!minLikesValidation.isValid && minLikesValidation.errors) {
        allErrors.push(...minLikesValidation.errors);
    }

    const maxLikesValidation = validateNumericRange(query.maxLikes, 0, undefined, 'maxLikes');
    if (!maxLikesValidation.isValid && maxLikesValidation.errors) {
        allErrors.push(...maxLikesValidation.errors);
    }

    // Validate minReplies and maxReplies
    const minRepliesValidation = validateNumericRange(query.minReplies, 0, undefined, 'minReplies');
    if (!minRepliesValidation.isValid && minRepliesValidation.errors) {
        allErrors.push(...minRepliesValidation.errors);
    }

    const maxRepliesValidation = validateNumericRange(query.maxReplies, 0, undefined, 'maxReplies');
    if (!maxRepliesValidation.isValid && maxRepliesValidation.errors) {
        allErrors.push(...maxRepliesValidation.errors);
    }

    // Validate search string
    const searchValidation = validateString(query.search, 1, 100, 'search');
    if (!searchValidation.isValid && searchValidation.errors) {
        allErrors.push(...searchValidation.errors);
    }

    // Check for logical consistency between min/max values
    if (minLikesValidation.parsedValue !== undefined && maxLikesValidation.parsedValue !== undefined) {
        if (minLikesValidation.parsedValue > maxLikesValidation.parsedValue) {
            allErrors.push('minLikes must be less than or equal to maxLikes.');
        }
    }

    if (minRepliesValidation.parsedValue !== undefined && maxRepliesValidation.parsedValue !== undefined) {
        if (minRepliesValidation.parsedValue > maxRepliesValidation.parsedValue) {
            allErrors.push('minReplies must be less than or equal to maxReplies.');
        }
    }

    return {
        isValid: allErrors.length === 0,
        errors: allErrors.length > 0 ? allErrors : undefined,
        pagination,
        sorting
    };
};

/**
 * Creates a standardized error response for validation failures
 * @param errors - Array of error messages
 * @returns Standardized error response object
 */
export const createValidationErrorResponse = (errors: string[]) => {
    return {
        message: 'Validation failed',
        errors: errors.map(error => ({
            field: 'query',
            message: error
        }))
    };
};