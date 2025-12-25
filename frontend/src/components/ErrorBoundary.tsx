import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error to an error reporting service
        console.error('Error caught by ErrorBoundary:', error, errorInfo);

        this.setState({
            error,
            errorInfo
        });

        // You can also log the error to a service here
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="flex justify-center items-center py-6" style={{ minHeight: 'calc(100vh - 140px)' }}>
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-[600px] text-content-center">
                        <h1 className="text-danger mb-4">Something went wrong</h1>
                        <p className="mb-6 text-secondary">We're sorry for the inconvenience. An unexpected error has occurred.</p>

                        <div className="flex justify-center gap-4 mb-6">
                            <button onClick={this.handleReset} className="btn btn-primary">
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="btn btn-secondary"
                            >
                                Go Home
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left bg-gray-50 p-4 rounded-md border-l-4 border-danger">
                                <summary className="font-semibold mb-2 cursor-pointer p-1 rounded-sm transition-all duration-300 hover:bg-red-50">Error Details</summary>
                                <div className="mt-4">
                                    <h4 className="mb-1 text-sm text-danger">Error:</h4>
                                    <pre className="bg-gray-100 p-4 rounded-sm overflow-x-auto text-sm text-gray-800">{this.state.error.toString()}</pre>

                                    <h4 className="mb-1 text-sm text-danger">Component Stack:</h4>
                                    <pre className="bg-gray-100 p-4 rounded-sm overflow-x-auto text-sm text-gray-800">{this.state.errorInfo?.componentStack}</pre>
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;