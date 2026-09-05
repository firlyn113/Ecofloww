'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { ReactNode, useEffect } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import ErrorBoundary from '@/src/components/features/ErrorBoundary';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  return (
    <ChakraProvider>
      <ErrorBoundary>
        <AuthProvider>{children}</AuthProvider>
      </ErrorBoundary>
    </ChakraProvider>
  );
}
