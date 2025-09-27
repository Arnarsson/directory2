"use client"

import React from "react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error }>
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} />
      }
      
      return (
        <div className="p-4 text-sm text-muted-foreground">
          Something went wrong. Please try refreshing the page.
        </div>
      )
    }

    return this.props.children
  }
}

// Default fallback component
export function DefaultErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="p-4 text-sm text-muted-foreground">
      <p>Something went wrong loading this component.</p>
      {error && process.env.NODE_ENV === "development" && (
        <details className="mt-2">
          <summary className="cursor-pointer">Error details</summary>
          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  )
}
