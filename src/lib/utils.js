import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a phone number to (888) 888-8888 format
 * Auto-formats as user types
 * @param {string} value - Raw input value
 * @returns {string} - Formatted phone number
 */
export function formatPhoneNumber(value) {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, "");

  // Limit to 10 digits
  const limitedDigits = digits.slice(0, 10);

  // Format based on length
  if (limitedDigits.length === 0) {
    return "";
  } else if (limitedDigits.length <= 3) {
    return `(${limitedDigits}`;
  } else if (limitedDigits.length <= 6) {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
  } else {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  }
}
