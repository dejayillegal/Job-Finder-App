'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { ErrorTracker } from '@/core/monitoring/ErrorTracker';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryState>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorTracker: ErrorTracker;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };

    this.errorTracker = new ErrorTracker();
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorId = this.errorTracker.captureError(error, {
      context: 'ErrorBoundary',
      errorInfo,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });

    this.setState({
      errorInfo,
      errorId,
    });

    // Report to monitoring service
    this.reportToMonitoring(error, errorInfo, errorId);
  }

  private reportToMonitoring = async (error: Error, errorInfo: ErrorInfo, errorId: string): Promise<void> => {
    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (reportingError) {
      console.error('Failed to report error to monitoring service:', reportingError);
    }
  };

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleReportBug = (): void => {
    if (this.state.errorId) {
      window.open(`/support/bug-report?errorId=${this.state.errorId}`, '_blank');
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;

      if (Fallback) {
        return <Fallback {...this.state} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Something went wrong
            </h1>

            <p className="text-gray-600 text-center mb-6">
              We apologize for the inconvenience. Our team has been notified and is working on a fix.
            </p>

            {this.state.errorId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Error ID:</strong> {this.state.errorId}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Please include this ID when contacting support.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={this.handleRetry}
                className="flex-1 flex items-center justify-center gap-2"
                variant="primary"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>

              <Button
                onClick={() => window.location.href = '/'}
                className="flex-1 flex items-center justify-center gap-2"
                variant="secondary"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>

              <Button
                onClick={this.handleReportBug}
                className="flex-1 flex items-center justify-center gap-2"
                variant="outline"
              >
                <Bug className="w-4 h-4" />
                Report Bug
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}