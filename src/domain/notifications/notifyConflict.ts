/**
 * Phase C Hardening: Centralized conflict notification
 *
 * This helper provides a single point of control for conflict notifications.
 * Currently uses alert(), but can be replaced with toast/modal without
 * touching calling code.
 */
export function notifyConflict(message: string): void {
  alert(message);
}
