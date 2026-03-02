/**
 * Error Monitoring Utility
 *
 * Centralized error capture and reporting.
 *
 * In production, this integrates with an external service.
 * To enable Sentry:
 *   1. npm install @sentry/nextjs
 *   2. Set NEXT_PUBLIC_SENTRY_DSN in .env
 *   3. The init() call below will auto-activate.
 *
 * Without Sentry, errors are logged to the console and stored
 * in-memory for a basic /api/errors endpoint if desired.
 */

type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';

interface ErrorReport {
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  timestamp: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  extra?: Record<string, unknown>;
}

// In-memory buffer for recent errors (last 50)
const errorBuffer: ErrorReport[] = [];
const MAX_BUFFER = 50;

// ─── Sentry lazy loader ───
let sentryHub: any = null;

async function getSentry() {
  if (sentryHub !== undefined && sentryHub !== null) return sentryHub;
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return null;

  try {
    // @ts-ignore - Sentry is an optional dependency
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,
    });
    sentryHub = Sentry;
    return Sentry;
  } catch {
    // Sentry not installed — fall through to console logging
    sentryHub = null;
    return null;
  }
}

// ─── Push to buffer ───
function pushToBuffer(report: ErrorReport) {
  errorBuffer.push(report);
  if (errorBuffer.length > MAX_BUFFER) {
    errorBuffer.shift();
  }
}

// ─── Build report ───
function buildReport(
  error: Error | string,
  severity: ErrorSeverity = 'error',
  extra?: Record<string, unknown>
): ErrorReport {
  const isError = error instanceof Error;
  const report: ErrorReport = {
    message: isError ? error.message : String(error),
    stack: isError ? error.stack : undefined,
    severity,
    timestamp: new Date().toISOString(),
    extra,
  };

  if (typeof window !== 'undefined') {
    report.url = window.location.href;
    report.userAgent = navigator.userAgent;

    // Try reading userId from Zustand persisted store
    try {
      const raw = localStorage.getItem('auth-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        report.userId = parsed?.state?.user?.id;
      }
    } catch {
      // ignore
    }
  }

  return report;
}

// ─── Public API ───

/**
 * Initialize error monitoring on app start.
 * Call once in a top-level layout or _app.
 */
export async function initErrorMonitoring() {
  const Sentry = await getSentry();

  // Global unhandled errors
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      captureError(event.error || event.message, 'error', {
        source: 'window.onerror',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      captureError(
        event.reason instanceof Error ? event.reason : String(event.reason),
        'error',
        { source: 'unhandledrejection' }
      );
    });
  }

  if (Sentry) {
    console.info('[ErrorMonitoring] Sentry initialized');
  } else {
    console.info('[ErrorMonitoring] Console-only mode (set NEXT_PUBLIC_SENTRY_DSN to enable Sentry)');
  }
}

/**
 * Capture an error with optional metadata.
 */
export async function captureError(
  error: Error | string,
  severity: ErrorSeverity = 'error',
  extra?: Record<string, unknown>
) {
  const report = buildReport(error, severity, extra);
  pushToBuffer(report);

  // Console logging
  if (process.env.NODE_ENV === 'development') {
    const level = severity === 'fatal' || severity === 'error' ? 'error' : 'warn';
    console[level](`[ErrorMonitoring] ${severity}:`, report.message, extra || '');
  }

  // Sentry
  const Sentry = await getSentry();
  if (Sentry) {
    if (error instanceof Error) {
      Sentry.captureException(error, {
        level: severity,
        extra,
      });
    } else {
      Sentry.captureMessage(String(error), {
        level: severity,
        extra,
      });
    }
  }

  // Send to custom endpoint if configured
  if (process.env.NEXT_PUBLIC_ERROR_ENDPOINT) {
    try {
      // Fire-and-forget
      fetch(process.env.NEXT_PUBLIC_ERROR_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }
}

/**
 * Capture a warning.
 */
export function captureWarning(message: string, extra?: Record<string, unknown>) {
  return captureError(message, 'warning', extra);
}

/**
 * Set the current user context for error reports.
 */
export async function setErrorUser(user: { id: string; email?: string; name?: string } | null) {
  const Sentry = await getSentry();
  if (Sentry) {
    Sentry.setUser(user ? { id: user.id, email: user.email, username: user.name } : null);
  }
}

/**
 * Get buffered errors (for debugging / admin dashboard).
 */
export function getRecentErrors(): ReadonlyArray<ErrorReport> {
  return [...errorBuffer];
}
