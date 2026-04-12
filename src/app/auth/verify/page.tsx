'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { activationService } from '@/services/activation.service';
import Link from 'next/link';
import { AlertCircle, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await activationService.verifyAndActivate(email, code);

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setError('Invalid or expired code. Please try again.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-green-600">Account Activated!</CardTitle>
            <CardDescription>Redirecting to login...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Account</CardTitle>
          <CardDescription>Enter your email and 6-digit code to activate your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">6-Digit Code *</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                maxLength={6}
                pattern="[0-9]{6}"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
              <p className="text-xs text-gray-500">Check your email for the code</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Verifying...' : 'Activate Account'}
            </Button>

            <div className="text-center text-sm">
              <Link href="/auth/register" className="text-gray-600 hover:text-gray-900 hover:underline">
                Need to register again?
              </Link>
            </div>

            <div className="text-center text-sm">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 hover:underline">
                Already activated? Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
