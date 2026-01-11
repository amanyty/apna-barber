'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, createShop } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Scissors, Mail, Lock, User, Phone, MapPin, Clock, Building2, ArrowRight, Loader2 } from 'lucide-react';

export default function BarberRegister() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [userData, setUserData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: '',
    });

    const [shopData, setShopData] = useState({
        shopName: '',
        description: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        shopPhone: '',
        openingTime: '09:00',
        closingTime: '21:00',
    });

    const handleNext = () => {
        if (!userData.email || !userData.password || !userData.fullName) {
            setError('Please fill all required fields');
            return;
        }
        if (userData.password !== userData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (userData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Starting barber registration...');

            // Create user account
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
            });

            console.log('SignUp result:', { hasData: !!data, hasError: !!signUpError });

            if (signUpError) {
                console.error('SignUp error:', signUpError);
                throw signUpError;
            }

            if (!data.user) {
                throw new Error('No user returned from signup');
            }

            console.log('User created, ID:', data.user.id);

            // Create user record with error handling
            console.log('Creating user record in database...');
            const { error: userInsertError } = await supabase.from('users').insert({
                id: data.user.id,
                email: userData.email,
                full_name: userData.fullName,
                phone: userData.phone,
                user_type: 'barber',
            });

            if (userInsertError) {
                console.error('User insert error:', userInsertError);
                throw new Error('Failed to create user profile: ' + userInsertError.message);
            }

            console.log('User record created successfully');

            // Create shop
            console.log('Creating shop record...');
            try {
                const shop = await createShop({
                    owner_id: data.user.id,
                    shop_name: shopData.shopName,
                    description: shopData.description,
                    address: shopData.address,
                    city: shopData.city,
                    state: shopData.state,
                    postal_code: shopData.postalCode,
                    phone: shopData.shopPhone,
                    opening_time: shopData.openingTime,
                    closing_time: shopData.closingTime,
                });

                console.log('Shop created successfully:', shop);

                if (!shop) {
                    throw new Error('Failed to create shop - no data returned');
                }

                console.log('Registration complete, redirecting...');
                router.push('/barber/dashboard');
            } catch (shopError: any) {
                console.error('Shop creation error:', shopError);
                throw new Error('Failed to create shop: ' + (shopError.message || 'Unknown error'));
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

            <Card className="w-full max-w-lg relative z-10 bg-white/95 backdrop-blur-lg shadow-2xl border-0">
                <CardHeader className="text-center pb-2">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <Scissors className="w-6 h-6 text-white" />
                        </div>
                    </Link>
                    <CardTitle className="text-2xl">Register Your Shop</CardTitle>
                    <CardDescription>
                        {step === 1 ? 'Step 1: Create your owner account' : 'Step 2: Add your shop details'}
                    </CardDescription>

                    {/* Progress indicator */}
                    <div className="flex gap-2 justify-center mt-4">
                        <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-purple-500' : 'bg-gray-200'}`} />
                        <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-purple-500' : 'bg-gray-200'}`} />
                    </div>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Your Full Name *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="fullName"
                                        type="text"
                                        value={userData.fullName}
                                        onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                                        required
                                        placeholder="John Doe"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={userData.email}
                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                        required
                                        placeholder="you@example.com"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={userData.phone}
                                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                        placeholder="+91 XXXXX XXXXX"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            value={userData.password}
                                            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                                            required
                                            placeholder="••••••"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm *</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={userData.confirmPassword}
                                            onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                                            required
                                            placeholder="••••••"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleNext} className="w-full h-12 text-base gap-2 bg-gradient-to-r from-purple-500 to-blue-600">
                                Continue to Shop Details
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="shopName">Shop Name *</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="shopName"
                                        type="text"
                                        value={shopData.shopName}
                                        onChange={(e) => setShopData({ ...shopData, shopName: e.target.value })}
                                        required
                                        placeholder="Classic Cuts Barber Shop"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address *</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="address"
                                        type="text"
                                        value={shopData.address}
                                        onChange={(e) => setShopData({ ...shopData, address: e.target.value })}
                                        required
                                        placeholder="123 Main Street, Near City Mall"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City *</Label>
                                    <Input
                                        id="city"
                                        type="text"
                                        value={shopData.city}
                                        onChange={(e) => setShopData({ ...shopData, city: e.target.value })}
                                        required
                                        placeholder="Mumbai"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        type="text"
                                        value={shopData.state}
                                        onChange={(e) => setShopData({ ...shopData, state: e.target.value })}
                                        placeholder="Maharashtra"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="postalCode">Postal Code</Label>
                                    <Input
                                        id="postalCode"
                                        type="text"
                                        value={shopData.postalCode}
                                        onChange={(e) => setShopData({ ...shopData, postalCode: e.target.value })}
                                        placeholder="400001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shopPhone">Shop Phone</Label>
                                    <Input
                                        id="shopPhone"
                                        type="tel"
                                        value={shopData.shopPhone}
                                        onChange={(e) => setShopData({ ...shopData, shopPhone: e.target.value })}
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="openingTime">Opening Time</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="openingTime"
                                            type="time"
                                            value={shopData.openingTime}
                                            onChange={(e) => setShopData({ ...shopData, openingTime: e.target.value })}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="closingTime">Closing Time</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="closingTime"
                                            type="time"
                                            value={shopData.closingTime}
                                            onChange={(e) => setShopData({ ...shopData, closingTime: e.target.value })}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 h-12 text-base gap-2 bg-gradient-to-r from-purple-500 to-blue-600"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            Complete Registration
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-purple-600 hover:underline font-semibold">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
