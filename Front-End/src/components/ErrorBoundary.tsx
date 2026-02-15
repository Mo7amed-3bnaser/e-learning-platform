'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * يلتقط الأخطاء في React components ويعرض UI بديل
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error caught by ErrorBoundary:', error);
            console.error('Error Info:', errorInfo);
        }

        // Update state with error details
        this.setState({
            error,
            errorInfo,
        });

        // TODO: Send error to logging service (e.g., Sentry)
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
                    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
                            عذراً، حدث خطأ غير متوقع
                        </h1>

                        {/* Description */}
                        <p className="text-center text-gray-600 mb-8">
                            نعتذر عن هذا الإزعاج. حدث خطأ أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.
                        </p>

                        {/* Error Details (Development Only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h3 className="text-sm font-semibold text-red-800 mb-2">
                                    تفاصيل الخطأ (Development Mode):
                                </h3>
                                <pre className="text-xs text-red-700 overflow-auto max-h-40 whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                حاول مرة أخرى
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                            >
                                العودة للصفحة الرئيسية
                            </button>
                        </div>

                        {/* Support Link */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500">
                                إذا استمرت المشكلة، يرجى{' '}
                                <a
                                    href="/contact"
                                    className="text-blue-600 hover:text-blue-700 underline"
                                >
                                    التواصل مع الدعم الفني
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
