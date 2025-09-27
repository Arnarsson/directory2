/**
 * Accessibility utility functions for consistent ARIA implementation
 */

/**
 * Generate descriptive ARIA labels for common UI elements
 */
export const ariaLabels = {
  // Navigation
  navigation: {
    main: "Main navigation",
    sidebar: "Sidebar navigation",
    mobile: "Mobile navigation menu",
    breadcrumb: "Breadcrumb navigation",
    pagination: "Pagination navigation",
  },

  // Actions
  actions: {
    close: "Close",
    open: "Open",
    toggle: "Toggle",
    expand: "Expand",
    collapse: "Collapse",
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    bookmark: "Bookmark",
    removeBookmark: "Remove bookmark",
  },

  // Content
  content: {
    loading: "Loading",
    error: "Error",
    success: "Success",
    info: "Information",
    warning: "Warning",
    empty: "No results found",
    results: "Search results",
    image: "Image",
    video: "Video",
    audio: "Audio",
  },

  // Forms
  forms: {
    required: "Required field",
    optional: "Optional field",
    invalid: "Invalid input",
    valid: "Valid input",
    help: "Help text",
    error: "Error message",
  },
}

/**
 * Generate ARIA labels with dynamic content
 */
export const generateAriaLabel = (
  baseLabel: string,
  context?: string,
  count?: number
): string => {
  if (context && count !== undefined) {
    return `${baseLabel} ${context} (${count} items)`
  }
  if (context) {
    return `${baseLabel} ${context}`
  }
  if (count !== undefined) {
    return `${baseLabel} (${count} items)`
  }
  return baseLabel
}

/**
 * Generate descriptive labels for interactive elements
 */
export const generateInteractiveLabel = (
  action: string,
  target: string,
  context?: string
): string => {
  if (context) {
    return `${action} ${target} in ${context}`
  }
  return `${action} ${target}`
}

/**
 * Generate status messages for screen readers
 */
export const generateStatusMessage = (
  action: string,
  result: string,
  context?: string
): string => {
  if (context) {
    return `${action} ${result} for ${context}`
  }
  return `${action} ${result}`
}

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Focus the first focusable element in a container
   */
  focusFirst: (container: HTMLElement | null) => {
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length > 0) {
      ;(focusableElements[0] as HTMLElement).focus()
    }
  },

  /**
   * Focus the last focusable element in a container
   */
  focusLast: (container: HTMLElement | null) => {
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length > 0) {
      const lastIndex = focusableElements.length - 1
      ;(focusableElements[lastIndex] as HTMLElement).focus()
    }
  },

  /**
   * Trap focus within a container (for modals, dropdowns)
   */
  trapFocus: (container: HTMLElement | null) => {
    if (!container) return

    const focusableElements = Array.from(
      container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      (el) =>
        !(
          el as
            | HTMLButtonElement
            | HTMLInputElement
            | HTMLSelectElement
            | HTMLTextAreaElement
        ).disabled
    ) as HTMLElement[]

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener("keydown", handleTabKey)

    // Return cleanup function
    return () => {
      container.removeEventListener("keydown", handleTabKey)
    }
  },
}

/**
 * Screen reader utilities
 */
export const screenReader = {
  /**
   * Announce a message to screen readers
   */
  announce: (message: string, priority: "polite" | "assertive" = "polite") => {
    const announcement = document.createElement("div")
    announcement.setAttribute("aria-live", priority)
    announcement.setAttribute("aria-atomic", "true")
    announcement.className = "sr-only"
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  },

  /**
   * Announce loading state
   */
  announceLoading: (context: string) => {
    screenReader.announce(`Loading ${context}`, "polite")
  },

  /**
   * Announce completion
   */
  announceComplete: (action: string, context: string) => {
    screenReader.announce(`${action} ${context} complete`, "polite")
  },

  /**
   * Announce error
   */
  announceError: (error: string, context: string) => {
    screenReader.announce(`Error: ${error} in ${context}`, "assertive")
  },
}

/**
 * Keyboard navigation utilities
 */
export const keyboardNavigation = {
  /**
   * Handle Enter key press
   */
  handleEnter: (callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      callback()
    }
  },

  /**
   * Handle Space key press
   */
  handleSpace: (callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === " ") {
      e.preventDefault()
      callback()
    }
  },

  /**
   * Handle Escape key press
   */
  handleEscape: (callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      callback()
    }
  },

  /**
   * Handle arrow key navigation
   */
  handleArrowKeys:
    (
      onUp?: () => void,
      onDown?: () => void,
      onLeft?: () => void,
      onRight?: () => void
    ) =>
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          onUp?.()
          break
        case "ArrowDown":
          e.preventDefault()
          onDown?.()
          break
        case "ArrowLeft":
          e.preventDefault()
          onLeft?.()
          break
        case "ArrowRight":
          e.preventDefault()
          onRight?.()
          break
      }
    },
}

/**
 * Common ARIA patterns
 */
export const ariaPatterns = {
  /**
   * Expandable/collapsible content
   */
  expandable: (id: string, expanded: boolean, controls: string) => ({
    "aria-expanded": expanded,
    "aria-controls": controls,
    "aria-describedby": id,
  }),

  /**
   * Search input
   */
  search: (resultsId?: string) => ({
    role: "searchbox",
    "aria-autocomplete": "list" as const,
    ...(resultsId && { "aria-controls": resultsId }),
  }),

  /**
   * Navigation menu
   */
  navigation: (label: string) => ({
    role: "navigation",
    "aria-label": label,
  }),

  /**
   * Button with loading state
   */
  loadingButton: (loading: boolean, label: string) => ({
    "aria-label": loading ? `${label} (loading)` : label,
    "aria-busy": loading,
    "aria-live": "polite" as const,
  }),

  /**
   * Image with fallback
   */
  image: (alt: string, decorative = false) => ({
    alt: decorative ? "" : alt,
    role: decorative ? "presentation" : undefined,
    "aria-hidden": decorative,
  }),

  /**
   * Form field with error
   */
  formField: (id: string, error?: string, required = false) => ({
    "aria-describedby": error ? `${id}-error` : undefined,
    "aria-invalid": !!error,
    "aria-required": required,
  }),
}
