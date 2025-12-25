// Generic form errors interface
export type FormErrors<T extends Record<string, any>> = {
    [K in keyof T]?: string;
};

// Form validation rules
export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
}

// Form validation configuration
export type ValidationConfig<T extends Record<string, any>> = {
    [K in keyof T]?: ValidationRule;
};

// Common validation patterns
export const ValidationPatterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    username: /^[a-zA-Z0-9_]{3,20}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    name: /^[a-zA-Z\s]+$/,
};

// Common validation messages
export const ValidationMessages = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    username: 'Username must be 3-20 characters and contain only letters, numbers, and underscores',
    password: 'Password must be at least 8 characters with uppercase, lowercase, and number',
    minLength: (min: number) => `Must be at least ${min} characters long`,
    maxLength: (max: number) => `Must be no more than ${max} characters long`,
    name: 'Please enter a valid name',
};