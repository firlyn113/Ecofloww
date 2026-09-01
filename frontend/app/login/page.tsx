'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
  Heading,
  Divider,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import apiClient from '@/lib/api';

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

const getFirebaseErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.',
    'auth/wrong-password': 'Kata sandi salah. Silakan coba lagi.',
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/email-already-in-use': 'Email sudah terdaftar. Gunakan email lain atau masuk.',
    'auth/weak-password': 'Kata sandi terlalu lemah. Gunakan minimal 6 karakter.',
    'auth/operation-not-allowed': 'Metode autentikasi tidak diizinkan.',
    'auth/invalid-credential': 'Email atau kata sandi salah.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
    'auth/network-request-failed': 'Koneksi jaringan gagal. Periksa internet Anda.',
    'auth/popup-closed-by-user': 'Popup sign-in ditutup sebelum selesai.',
    'auth/cancelled-popup-request': 'Permintaan popup dibatalkan.',
    'auth/account-exists-with-different-credential': 'Akun sudah ada dengan metode sign-in berbeda.',
  };
  return errorMessages[errorCode] || 'Autentikasi gagal. Silakan coba lagi.';
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSuccess = () => {
    router.push('/dashboard');
  };

  const persistProfile = async (displayName: string, phoneNumber: string) => {
    try {
      await apiClient.patch('/api/v1/users/me', {
        name: displayName,
        phone: phoneNumber,
      });
    } catch (error) {
      console.error('Gagal menyimpan profil:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(userCredential.user, { displayName: name.trim() });
        }
        await persistProfile(name.trim(), phone.trim());
        toast({
          title: 'Akun berhasil dibuat',
          description: 'Selamat datang di EcoFlow AI!',
          status: 'success',
          isClosable: true,
        });
        handleSuccess();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        handleSuccess();
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      const errorMessage = err.code ? getFirebaseErrorMessage(err.code) : (err.message || 'Autentikasi gagal');
      toast({
        title: 'Gagal masuk',
        description: errorMessage,
        status: 'error',
        isClosable: true,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      persistProfile(result.user.displayName || '', '');
      handleSuccess();
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      const errorMessage = err.code ? getFirebaseErrorMessage(err.code) : (err.message || 'Google sign-in gagal');
      toast({
        title: 'Gagal masuk dengan Google',
        description: errorMessage,
        status: 'error',
        isClosable: true,
        duration: 5000,
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Container maxW="sm" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Stack spacing="2">
          <Heading textAlign="center" size="xl" color="#34A853">
            EcoFlow
          </Heading>
          <Text textAlign="center" fontSize="sm" color="gray.600">
            Asisten Fermentasi Eco-Enzyme Pintar
          </Text>
        </Stack>

        <Box
          py={{ base: '8', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={{ base: 'transparent', sm: 'white' }}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius="lg"
        >
          <Stack spacing="md">
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              isLoading={googleLoading}
              bg="white"
              color="gray.800"
              borderWidth="1px"
              borderColor="gray.300"
              width="full"
              leftIcon={<GoogleLogo />}
              _hover={{ bg: 'gray.50' }}
            >
              {isSignUp ? 'Daftar dengan Google' : 'Masuk dengan Google'}
            </Button>

            <Divider />

            <form onSubmit={handleAuth}>
              <Stack spacing="5">
                {isSignUp && (
                  <FormControl>
                    <FormLabel htmlFor="name">Nama lengkap</FormLabel>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Nama Lengkap"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </FormControl>
                )}

                <FormControl>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@contoh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormControl>

                {isSignUp && (
                  <FormControl>
                    <FormLabel htmlFor="phone">Nomor telepon</FormLabel>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+62 812-3456-7890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </FormControl>
                )}

                <FormControl>
                  <FormLabel htmlFor="password">Kata sandi</FormLabel>
                  <InputGroup>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword((prev) => !prev)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  bg="#34A853"
                  color="white"
                  isLoading={loading}
                  _hover={{ bg: '#2a8a42' }}
                >
                  {isSignUp ? 'Daftar' : 'Masuk'}
                </Button>

                <Text textAlign="center" fontSize="sm">
                  {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
                  <Button
                    variant="link"
                    color="#34A853"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? 'Masuk' : 'Daftar'}
                  </Button>
                </Text>
              </Stack>
            </form>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}