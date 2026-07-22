import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ChunkErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if the error is related to failing to load a JavaScript chunk
    const isChunkLoadError = 
      error.name === 'ChunkLoadError' || 
      (error.message && error.message.toLowerCase().includes('failed to fetch dynamically imported module')) ||
      (error.message && error.message.toLowerCase().includes('importing a module script failed'));

    if (isChunkLoadError) {
      console.warn('ChunkLoadError detected. The server likely rebuilt. Forcing page reload...');
      // Force a full page reload to grab the new chunks
      window.location.reload();
    } else {
      console.error('An unexpected error occurred:', error, errorInfo);
    }
  }

  render() {
    if ((this as any).state.hasError) {
      // While it reloads, show a friendly updating message instead of a blank page or crash
      return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 flex-col gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy" style={{ borderColor: 'var(--color-navy, #002B7F)' }}></div>
          <p className="text-gray-600 font-medium" style={{ fontFamily: 'var(--font-inter, sans-serif)' }}>
            Updating application to the latest version...
          </p>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
