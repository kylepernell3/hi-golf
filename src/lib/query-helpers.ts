/**
 * Safe query helper utilities for Supabase database queries
 * Provides type-safe wrappers and error handling for common patterns
 */

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Safely fetches a single row from Supabase with proper type assertion
 * Returns null if no data found, throws if error occurs
 */
export async function safeSingleQuery<T>(
  query: ReturnType<SupabaseClient['from']>['select'],
  errorMessage?: string
): Promise<T | null> {
  const { data, error } = await query.maybeSingle()
  
  if (error) {
    console.error(errorMessage || 'Database query error:', error)
    throw new Error(errorMessage || 'Failed to fetch data')
  }
  
  return (data as T) || null
}

/**
 * Safely fetches multiple rows with proper type assertion
 */
export async function safeArrayQuery<T>(
  query: ReturnType<SupabaseClient['from']>['select'],
  errorMessage?: string
): Promise<T[]> {
  const { data, error } = await query
  
  if (error) {
    console.error(errorMessage || 'Database query error:', error)
    throw new Error(errorMessage || 'Failed to fetch data')
  }
  
  return (data as T[]) || []
}

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
