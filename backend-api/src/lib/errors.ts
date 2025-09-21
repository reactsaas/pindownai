import { FastifyError } from 'fastify';

// Error Types
export type ErrorType = 
  | 'authentication'
  | 'authorization' 
  | 'validation'
  | 'not_found'
  | 'rate_limit'
  | 'server'
  | 'firebase';

// Error Codes
export type ErrorCode = 
  | 'AUTH_REQUIRED'
  | 'AUTH_INVALID'
  | 'AUTH_EXPIRED'
  | 'AUTH_METHOD_INVALID'
  | 'PERMISSION_DENIED'
  | 'VALIDATION_FAILED'
  | 'RESOURCE_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'FIREBASE_ERROR'
  | 'INTERNAL_SERVER_ERROR';

// Custom Error Class
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    code: ErrorCode,
    type: ErrorType,
    message: string,
    statusCode: number = 500,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Error Factory Functions
export const createAuthError = (code: ErrorCode, message: string, details?: any) => 
  new AppError(code, 'authentication', message, 401, details);

export const createAuthzError = (code: ErrorCode, message: string, details?: any) => 
  new AppError(code, 'authorization', message, 403, details);

export const createValidationError = (code: ErrorCode, message: string, details?: any) => 
  new AppError(code, 'validation', message, 400, details);

export const createNotFoundError = (code: ErrorCode, message: string, details?: any) => 
  new AppError(code, 'not_found', message, 404, details);

export const createServerError = (code: ErrorCode, message: string, details?: any) => 
  new AppError(code, 'server', message, 500, details);

export const createFirebaseError = (code: ErrorCode, message: string, details?: any) => 
  new AppError(code, 'firebase', message, 500, details);

// Predefined Errors
export const ERRORS = {
  AUTH_REQUIRED: createAuthError('AUTH_REQUIRED', 'Valid Firebase token or API key required'),
  AUTH_INVALID: createAuthError('AUTH_INVALID', 'Invalid authentication credentials'),
  AUTH_EXPIRED: createAuthError('AUTH_EXPIRED', 'Authentication token has expired'),
  AUTH_METHOD_INVALID: createAuthError('AUTH_METHOD_INVALID', 'Invalid authentication method'),
  
  PERMISSION_DENIED: createAuthzError('PERMISSION_DENIED', 'You do not have permission to access this resource'),
  
  VALIDATION_FAILED: createValidationError('VALIDATION_FAILED', 'Request validation failed'),
  
  RESOURCE_NOT_FOUND: createNotFoundError('RESOURCE_NOT_FOUND', 'Resource not found'),
  
  FIREBASE_ERROR: createFirebaseError('FIREBASE_ERROR', 'Firebase operation failed'),
  INTERNAL_SERVER_ERROR: createServerError('INTERNAL_SERVER_ERROR', 'An internal server error occurred'),
} as const;

// Error Response Format
export interface ErrorResponse {
  error: string;
  message: string;
}

// Create Error Response
export function createErrorResponse(error: AppError | Error | FastifyError): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: error.message,
      message: error.code
    };
  }

  // Handle Fastify Validation Errors
  if ('validation' in error && error.validation) {
    return {
      error: 'Request validation failed',
      message: 'VALIDATION_FAILED'
    };
  }

  // Handle generic errors
  return {
    error: error.message || 'An internal server error occurred',
    message: 'INTERNAL_SERVER_ERROR'
  };
}

// Check if error is AppError
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

// Check if error is Fastify validation error
export function isValidationError(error: any): error is FastifyError & { validation: any[] } {
  return 'validation' in error && Array.isArray(error.validation);
}


