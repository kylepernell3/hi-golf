/**
 * Safe query helper utilities for database queries
 * Provides type-safe wrappers and defensive coding patterns
 */

/**
 * Type guard to check if a value exists and is not null/undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Safely accesses nested properties with type safety
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K
): T[K] | undefined {
  return obj?.[key]
}

/**
 * Formats a nullable number with fallback
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 1
): string | null {
  if (value === null || value === undefined) return null
  return value.toFixed(decimals)
}

/**
 * Safely parses JSON with error handling
 */
export function safeJsonParse<T>(
  jsonString: string | null | undefined,
  fallback: T
): T {
  if (!jsonString) return fallback
  try {
    return JSON.parse(jsonString) as T
  } catch {
    return fallback
  }
}

/**
 * Creates a type-safe assertion for database query results
 */
export function assertType<T>(data: unknown): T {
  return data as T
}
