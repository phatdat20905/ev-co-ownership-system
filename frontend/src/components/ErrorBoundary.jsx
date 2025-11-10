// src/components/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    });

    // TODO: Send error to logging service (e.g., Sentry, LogRocket)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard/coowner';
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI when error occurs
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Oops! Something went wrong
                  </h1>
                  <p className="text-red-100 mt-1">
                    We encountered an unexpected error. Don't worry, we're on it!
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Error Message */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">
                    Error Details (Development Only)
                  </h3>
                  <p className="text-sm text-red-700 font-mono break-all">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-3">
                      <summary className="text-sm font-medium text-red-700 cursor-pointer hover:text-red-800">
                        Component Stack
                      </summary>
                      <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-48 bg-white p-2 rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* What Happened */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  What happened?
                </h3>
                <p className="text-gray-600">
                  The application encountered an unexpected error while processing your request. 
                  This could be due to a temporary issue or a bug in the code.
                </p>
              </div>

              {/* What You Can Do */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  What you can do:
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                      1
                    </span>
                    <span>Try refreshing the page to see if the issue resolves itself</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                      2
                    </span>
                    <span>Go back to the home page and try a different action</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                      3
                    </span>
                    <span>If the problem persists, contact support with the error details</span>
                  </li>
                </ul>
              </div>

              {/* Error Stats (Development) */}
              {process.env.NODE_ENV === 'development' && this.state.errorCount > 1 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This error has occurred <strong>{this.state.errorCount} times</strong> in this session.
                    Consider investigating the root cause.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </button>
              </div>

              {/* Support Info */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-2">Need help?</p>
                <p>
                  Contact support at{' '}
                  <a href="mailto:support@evco.com" className="text-blue-600 hover:underline">
                    support@evco.com
                  </a>
                  {' '}or visit our{' '}
                  <a href="/help" className="text-blue-600 hover:underline">
                    help center
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Render children if no error
    return this.props.children;
  }
}

export default ErrorBoundary;
