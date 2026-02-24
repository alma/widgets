/**
 * Standardized logging utility for Alma Widgets
 * Provides consistent error and warning messages across all components
 */

type LogLevel = 'error' | 'warn' | 'info'

interface LogContext {
  component?: string
  method?: string
}

const formatMessage = (_level: LogLevel, context: LogContext | undefined, message: string) => {
  const prefix = context?.component ? `[${context.component}]` : '[Alma Widget]'
  const method = context?.method ? `${context.method}:` : ''
  return `${prefix}${method ? ` ${method}` : ''} ${message}`
}

export const logger = {
  /**
   * Log an error with optional context
   */
  error(message: string, context?: LogContext) {
    console.error(formatMessage('error', context, message))
  },

  /**
   * Log a warning with optional context
   */
  warn(message: string, context?: LogContext) {
    console.warn(formatMessage('warn', context, message))
  },

  /**
   * Log info message (only in development)
   */
  info(message: string, context?: LogContext) {
    // Only log in development by checking for common dev indicators
    const isDev =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('dev') ||
        (window as any).__DEV__)

    if (isDev) {
      console.info(formatMessage('info', context, message))
    }
  },

  /**
   * Log when a container or element is not found
   */
  elementNotFound(selector: string, context?: LogContext) {
    this.error(`Element not found: ${selector}`, context)
  },

  /**
   * Log when a method is missing on an element
   */
  methodNotFound(methodName: string, elementType: string, context?: LogContext) {
    this.error(`Method ${methodName}() not found on ${elementType}`, context)
  },

  /**
   * Log API errors
   */
  apiError(status: number, message: string, context?: LogContext) {
    this.error(`API Error (${status}): ${message}`, context)
  },

  /**
   * Log when widget is missing required configuration
   */
  missingConfig(property: string, context?: LogContext) {
    this.error(`Missing required configuration: ${property}`, context)
  },
}
