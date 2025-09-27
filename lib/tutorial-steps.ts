// Single source of truth for tutorial steps
export const TUTORIAL_STEPS = [
  // Main tutorial steps
  "Sign Up as First User (Auto-Admin)",
  "Configure Seed URLs",
  "Read the Seed Documentation", 
  "Run the AI Enrichment Script",
  "Access Admin Dashboard",
  // Supabase setup steps
  "Create Supabase project",
  "Setup environment variables",
  "Link CLI to project", 
  "Run database migrations",
  "Restart development server",
] as const

export type TutorialStep = typeof TUTORIAL_STEPS[number]

// Helper functions for tutorial progress
export const getTutorialProgress = (): { completed: number; total: number; percentage: number } => {
  if (typeof window === "undefined") {
    return { completed: 0, total: TUTORIAL_STEPS.length, percentage: 0 }
  }

  const completedSteps = TUTORIAL_STEPS.filter((step) => {
    const stored = localStorage.getItem(`tutorial-step-${step}`)
    return stored ? JSON.parse(stored) : false
  }).length

  return {
    completed: completedSteps,
    total: TUTORIAL_STEPS.length,
    percentage: Math.round((completedSteps / TUTORIAL_STEPS.length) * 100)
  }
}

export const resetTutorialProgress = (): void => {
  if (typeof window === "undefined") return
  
  TUTORIAL_STEPS.forEach((step) => {
    localStorage.removeItem(`tutorial-step-${step}`)
  })
  
  // Notify progress update
  window.dispatchEvent(new CustomEvent("tutorialProgressUpdate"))
  
  // Reload the page to reset all checkboxes
  window.location.reload()
}

export const notifyProgressUpdate = (): void => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tutorialProgressUpdate"))
  }
}