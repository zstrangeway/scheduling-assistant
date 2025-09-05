// Shared component props for common patterns

// Loading and error state props
export interface LoadingProps {
  loading?: boolean
}

export interface ErrorProps {
  error?: string | null
}

export interface LoadingErrorProps extends LoadingProps, ErrorProps {}

// Common callback props
export interface SuccessCallbackProps {
  onSuccess?: () => void
}

export interface CancelCallbackProps {
  onCancel?: () => void
}

export interface ActionCallbackProps extends SuccessCallbackProps, CancelCallbackProps {}

// Form state props
export interface FormLoadingProps {
  loading: boolean
  error: string | null
}

// Common CRUD callback patterns
export interface EntityCallbacks {
  onCreated?: () => void
  onUpdated?: () => void
  onDeleted?: () => void
}

// Async action state
export interface AsyncActionState {
  loading: boolean
  error: string | null
}