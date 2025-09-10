import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/**
 * Generate a unique pin ID using Firebase push key
 */
export function generatePinId(): string {
  // Firebase will generate a unique key automatically
  // We'll use Firebase's push() method which generates keys like: -N1234567890abcdef
  return ''; // Empty string - Firebase will generate the key
}

/**
 * Generate a unique API key
 */
export function generateApiKey(): string {
  return `pk_${uuidv4().replace(/-/g, '')}`;
}

/**
 * Hash an API key for storage
 */
export function hashApiKey(apiKey: string, salt: string): string {
  return crypto.createHash('sha256').update(apiKey + salt).digest('hex');
}

/**
 * Generate a unique workflow ID
 */
export function generateWorkflowId(): string {
  return `wd_${uuidv4().substring(0, 8)}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Check if user has required permission
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('*');
}

/**
 * Extract workflow sources from content
 */
export function extractWorkflowSources(content: string): string[] {
  const workflowRegex = /\{\{wd_([a-zA-Z0-9_]+)\./g;
  const sources = new Set<string>();
  let match;
  
  while ((match = workflowRegex.exec(content)) !== null) {
    sources.add(`wd_${match[1]}`);
  }
  
  return Array.from(sources);
}

/**
 * Validate JSON content
 */
export function isValidJSON(content: string): boolean {
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create error response
 */
export function createErrorResponse(error: string, message?: string, details?: any) {
  return {
    error,
    message,
    details,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create success response
 */
export function createSuccessResponse(data?: any, message?: string) {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

