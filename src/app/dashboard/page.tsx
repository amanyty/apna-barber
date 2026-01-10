'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getCustomerAppointments, cancelAppointment, confirmPayment } from '@/lib/supabase';
import { Appointment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTime, formatCurrency, getStatusColor, getPaymentStatusColor } from '@/lib/utils';
import {
    Calendar, Clock, MapPin, Scissors, Star, Check, X,
    Loader2, LogOut, User, CheckCircle, AlertCircle
} from 'lucide-react';

export default function CustomerDashboard() {
    const router = useRouter();
    const { user, userData, loading: authLoading, signOut } = useAuth();

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [justBooked, setJustBooked] = useState(false);

    useEffect(() => {
        // Check for booked param on client side only
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            setJustBooked(params.get('booked') === 'true');
        }
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            loadAppointments();
        }
    }, [user, authLoading]);

    const loadAppointments = async () => {
        if (!user) return;
        try {
            const data = await getCustomerAppointments(user.id);
            setAppointments(data || []);
        } catch (error) {
            console.error('Error loading appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (appointmentId: string) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        setActionLoading(appointmentId);
        try {
            await cancelAppointment(appointmentId, 'Cancelled by customer');
            loadAppointments();
        } catch (error) {
            console.error('Error cancelling:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleConfirmPayment = async (appointmentId: string) => {
        setActionLoading(appointmentId);
        try {
            await confirmPayment(appointmentId, 'customer');
            loadAppointments();
        } catch (error) {
            console.error('Error confirming payment:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const upcomingAppointments = appointments.filter(
        a => ['pending', 'confirmed'].includes(a.status)
    );
    const pastAppointments = appointments.filter(
        a => ['completed', 'cancelled', 'no-show'].includes(a.status)
    );

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Scissors className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">Apna Barber</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-600" />
                                </div>
                                <span className="text-sm font-medium hidden sm:inline">{userData?.full_name}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success Message */}
                {justBooked && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                            <p className="font-semibold text-green-800">Appointment Booked Successfully!</p>
                            <p className="text-sm text-green-600">You will receive confirmation from the barber shop soon.</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">My Appointments</h1>
                        <p className="text-gray-600 mt-1">Manage your bookings and payment confirmations</p>
                    </div>
                    <Link href="/search">
                        <Button>
                            <Calendar className="w-4 h-4 mr-2" />
                            Book New
                        </Button>
                    </Link>
                </div>

                {/* Upcoming Appointments */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
                    {upcomingAppointments.length > 0 ? (
                        <div className="grid gap-4">
                            {upcomingAppointments.map((apt) => (
                                <Card key={apt.id} className="overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
                                                    <Scissors className="w-8 h-8 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{(apt.shops as any)?.shop_name}</h3>
                                                    <p className="text-gray-600">{(apt.services as any)?.service_name}</p>
                                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {formatDate(apt.appointment_date)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {formatTime(apt.start_time)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(apt.status)}`}>
                                                        {apt.status}
                                                    </span>
                                                    <span className="font-bold text-lg">{formatCurrency(apt.total_amount)}</span>
                                                </div>

                                                {/* Payment confirmation */}
                                                <div className="flex items-center gap-2 text-sm">
                                                    {apt.payment_confirmed_by_customer ? (
                                                        <span className="flex items-center gap-1 text-green-600">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Payment confirmed by you
                                                        </span>
                                                    ) : apt.status === 'completed' && (
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            onClick={() => handleConfirmPayment(apt.id)}
                                                            disabled={actionLoading === apt.id}
                                                        >
                                                            {actionLoading === apt.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Check className="w-4 h-4 mr-1" />
                                                                    Confirm Payment Done
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>

                                                {apt.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleCancel(apt.id)}
                                                        disabled={actionLoading === apt.id}
                                                    >
                                                        {actionLoading === apt.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <X className="w-4 h-4 mr-1" />
                                                                Cancel
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No upcoming appointments</h3>
                                <p className="text-gray-600 mb-4">Book your next haircut now!</p>
                                <Link href="/search">
                                    <Button>Find a Barber</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Past Appointments */}
                {pastAppointments.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Past Appointments</h2>
                        <div className="grid gap-4">
                            {pastAppointments.map((apt) => (
                                <Card key={apt.id} className="opacity-75">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold">{(apt.shops as any)?.shop_name}</h3>
                                                <p className="text-gray-600 text-sm">{(apt.services as any)?.service_name}</p>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    {formatDate(apt.appointment_date)} at {formatTime(apt.start_time)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(apt.status)}`}>
                                                    {apt.status}
                                                </span>
                                                <span className="font-semibold">{formatCurrency(apt.total_amount)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
