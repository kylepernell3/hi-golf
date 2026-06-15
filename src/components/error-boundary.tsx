'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
          <div className="max-w-md rounded-lg bg-zinc-900 p-6 text-center">
            <h2 className="mb-2 text-xl font-semibold text-white">Something went wrong</h2>
            <p className="text-zinc-400 mb-4">We encountered an unexpected error</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
