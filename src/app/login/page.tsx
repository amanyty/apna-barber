'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Scissors, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            if (data.user) {
                // Check user type to redirect appropriately
                const { data: userData } = await supabase
                    .from('users')
                    .select('user_type')
                    .eq('id', data.user.id)
                    .single();

                if (userData?.user_type === 'barber') {
                    router.push('/barber/dashboard');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

            <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-lg shadow-2xl border-0">
                <CardHeader className="text-center pb-2">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Scissors className="w-6 h-6 text-white" />
                        </div>
                    </Link>
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>Sign in to continue booking appointments</CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">Password</Label>
                                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-base gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">New to Apna Barber?</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Link href="/register" className="block">
                            <Button variant="outline" className="w-full h-11">
                                Create a Customer Account
                            </Button>
                        </Link>
                        <Link href="/barber/register" className="block">
                            <Button variant="ghost" className="w-full h-11 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                Register Your Barber Shop
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
