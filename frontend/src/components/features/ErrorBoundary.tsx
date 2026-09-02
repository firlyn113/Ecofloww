'use client';

import { Component, ReactNode } from 'react';
import { Button, Container, Heading, Text, VStack } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxW="md" py={20}>
          <VStack spacing={6} textAlign="center">
            <Heading size="lg" color="red.500">
              Terjadi Kesalahan
            </Heading>
            <Text color="gray.600">
              {typeof this.state.error?.message === 'string'
                ? this.state.error.message
                : typeof this.state.error === 'string'
                ? this.state.error
                : Array.isArray(this.state.error?.message)
                ? (this.state.error.message as Array<{ msg?: string }>).map((e) => e.msg).join(', ')
                : typeof this.state.error === 'object' && this.state.error !== null
                ? JSON.stringify(this.state.error)
                : 'Something went wrong.'}
            </Text>
            <Button
              bg="#34A853"
              color="white"
              _hover={{ bg: '#2a8a42' }}
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Muat Ulang
            </Button>
          </VStack>
        </Container>
      );
    }

    return this.props.children;
  }
}
