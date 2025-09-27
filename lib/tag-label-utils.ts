/**
 * Utility functions for handling tags and labels in the database
 * Converts between snake_case (database storage) and display format
 */

/**
 * Converts a display string to snake_case for database storage
 * Examples:
 * - "Design Systems" → "design_systems"
 * - "UI Components" → "ui_components"
 * - "React Hooks" → "react_hooks"
 */
export function toSnakeCase(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-z0-9_]/g, "") // Remove special characters except underscores
    .replace(/_+/g, "_") // Replace multiple underscores with single
    .replace(/^_|_$/g, "") // Remove leading/trailing underscores
}

/**
 * Converts a display string to a tag format that preserves hyphens
 * Examples:
 * - "CSS Frameworks" → "css-frameworks"
 * - "UI Components" → "ui-components"
 * - "React Hooks" → "react-hooks"
 */
export function toTagFormat(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove special characters except hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
}

/**
 * Converts snake_case back to display format
 * Examples:
 * - "design_systems" → "Design Systems"
 * - "ui_components" → "Ui Components"
 * - "react_hooks" → "React Hooks"
 */
export function fromSnakeCase(snakeCase: string): string {
  return snakeCase
    .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
    .trim()
}

/**
 * Converts a display string to a URL-safe slug
 * Examples:
 * - "Design Systems" → "design-systems"
 * - "UI Components" → "ui-components"
 * - "React Hooks" → "react-hooks"
 */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove special characters except hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
}

/**
 * Converts a slug back to display format
 * Examples:
 * - "design-systems" → "Design Systems"
 * - "ui-components" → "Ui Components"
 * - "react-hooks" → "React Hooks"
 */
export function fromSlug(slug: string): string {
  return slug
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
    .trim()
}

/**
 * Normalizes a string for consistent processing
 * Removes extra whitespace and normalizes unicode characters
 */
export function normalizeString(str: string): string {
  return str
    .normalize("NFD") // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .trim()
    .replace(/\s+/g, " ") // Normalize whitespace
}

/**
 * Batch convert an array of display strings to snake_case
 */
export function batchToSnakeCase(strings: string[]): string[] {
  return strings.map(toSnakeCase).filter(Boolean)
}

/**
 * Batch convert an array of display strings to tag format (preserving hyphens)
 */
export function batchToTagFormat(strings: string[]): string[] {
  return strings.map(toTagFormat).filter(Boolean)
}

/**
 * Batch convert an array of snake_case strings to display format
 */
export function batchFromSnakeCase(strings: string[]): string[] {
  return strings.map(fromSnakeCase).filter(Boolean)
}

/**
 * Batch convert an array of display strings to slugs
 */
export function batchToSlug(strings: string[]): string[] {
  return strings.map(toSlug).filter(Boolean)
}

/**
 * Batch convert an array of slugs to display format
 */
export function batchFromSlug(strings: string[]): string[] {
  return strings.map(fromSlug).filter(Boolean)
}
