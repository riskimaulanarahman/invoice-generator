// Date formatting utilities

import { format, parseISO, isValid, differenceInDays, addDays } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

/**
 * Format date to Indonesian locale
 * @param dateString - ISO date string
 * @param formatStr - Optional custom format string
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  formatStr: string = 'dd MMMM yyyy'
): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '-';
    return format(date, formatStr, { locale: localeId });
  } catch {
    return '-';
  }
}

/**
 * Format date to short format (dd/MM/yyyy)
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDateShort(dateString: string): string {
  return formatDate(dateString, 'dd/MM/yyyy');
}

/**
 * Format date for input field (yyyy-MM-dd)
 * @param date - Date object or string
 * @returns Date string in yyyy-MM-dd format
 */
export function formatDateForInput(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '';
    return format(d, 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

/**
 * Get today's date in ISO format
 * @returns Today's date as yyyy-MM-dd string
 */
export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get date 30 days from now in ISO format
 * @returns Date 30 days from now as yyyy-MM-dd string
 */
export function getDefaultDueDate(): string {
  return format(addDays(new Date(), 30), 'yyyy-MM-dd');
}

/**
 * Calculate days until due date
 * @param dueDateString - ISO date string
 * @returns Number of days (negative if overdue)
 */
export function getDaysUntilDue(dueDateString: string): number {
  try {
    const dueDate = parseISO(dueDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return differenceInDays(dueDate, today);
  } catch {
    return 0;
  }
}

/**
 * Check if a date is overdue
 * @param dueDateString - ISO date string
 * @returns Boolean indicating if overdue
 */
export function isOverdue(dueDateString: string): boolean {
  return getDaysUntilDue(dueDateString) < 0;
}

/**
 * Validate due date is not before issue date
 * @param issueDate - Issue date string
 * @param dueDate - Due date string
 * @returns Boolean indicating if valid
 */
export function validateDueDate(issueDate: string, dueDate: string): boolean {
  try {
    const issue = parseISO(issueDate);
    const due = parseISO(dueDate);
    return isValid(issue) && isValid(due) && due >= issue;
  } catch {
    return false;
  }
}

/**
 * Format date range
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`;
}
