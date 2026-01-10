'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import {
    getShopByOwnerId, getShopAppointments, getShopStats,
    updateAppointmentStatus, confirmPayment, getShopServices,
    createService, updateService, deleteService
} from '@/lib/supabase';
import { Shop, Appointment, Service } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate, formatTime, formatCurrency, getStatusColor, getPaymentStatusColor } from '@/lib/utils';
import {
    Calendar, Clock, Users, IndianRupee, Scissors, Star,
    Check, X, Loader2, LogOut, User, Plus, Edit, Trash2,
    CheckCircle, AlertCircle, TrendingUp, ChevronDown
} from 'lucide-react';

type Tab = 'appointments' | 'services' | 'analytics';

export default function BarberDashboard() {
    const router = useRouter();
    const { user, userData, loading: authLoading, signOut } = useAuth();

    const [shop, setShop] = useState<Shop | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState<Tab>('appointments');

    // Service form
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [serviceForm, setServiceForm] = useState({
        service_name: '',
        description: '',
        duration_minutes: 30,
        price: 0,
        category: '',
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (userData?.user_type !== 'barber') {
                router.push('/dashboard');
            } else {
                loadDashboardData();
            }
        }
    }, [user, userData, authLoading]);

    useEffect(() => {
        if (shop) {
            loadAppointments();
        }
    }, [selectedDate, shop]);

    const loadDashboardData = async () => {
        if (!user) return;
        try {
            const shopData = await getShopByOwnerId(user.id);
            if (!shopData) {
                router.push('/barber/register');
                return;
            }
            setShop(shopData);

            const [statsData, servicesData] = await Promise.all([
                getShopStats(shopData.id),
                getShopServices(shopData.id),
            ]);
            setStats(statsData);
            setServices(servicesData || []);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAppointments = async () => {
        if (!shop) return;
        try {
            const data = await getShopAppointments(shop.id, selectedDate);
            setAppointments(data || []);
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
    };

    const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
        setActionLoading(appointmentId);
        try {
            await updateAppointmentStatus(appointmentId, newStatus);
            loadAppointments();
            loadDashboardData();
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleConfirmPayment = async (appointmentId: string) => {
        setActionLoading(appointmentId);
        try {
            await confirmPayment(appointmentId, 'shop');
            loadAppointments();
        } catch (error) {
            console.error('Error confirming payment:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleServiceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shop) return;

        setActionLoading('service');
        try {
            if (editingService) {
                await updateService(editingService.id, serviceForm);
            } else {
                await createService({
                    shop_id: shop.id,
                    ...serviceForm,
                });
            }
            setShowServiceForm(false);
            setEditingService(null);
            setServiceForm({ service_name: '', description: '', duration_minutes: 30, price: 0, category: '' });
            loadDashboardData();
        } catch (error) {
            console.error('Error saving service:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteService = async (serviceId: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        setActionLoading(serviceId);
        try {
            await deleteService(serviceId);
            loadDashboardData();
        } catch (error) {
            console.error('Error deleting service:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleEditService = (service: Service) => {
        setEditingService(service);
        setServiceForm({
            service_name: service.service_name,
            description: service.description || '',
            duration_minutes: service.duration_minutes,
            price: service.price,
            category: service.category || '',
        });
        setShowServiceForm(true);
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Scissors className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold">{shop?.shop_name}</h1>
                                <p className="text-xs text-white/70">Barber Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm hidden sm:inline">{userData?.full_name}</span>
                            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/20">
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/80">Today</p>
                                    <p className="text-3xl font-bold">{stats?.todayAppointments || 0}</p>
                                </div>
                                <Calendar className="w-10 h-10 text-white/50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/80">Total Appointments</p>
                                    <p className="text-3xl font-bold">{stats?.totalAppointments || 0}</p>
                                </div>
                                <Users className="w-10 h-10 text-white/50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/80">Total Revenue</p>
                                    <p className="text-3xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
                                </div>
                                <IndianRupee className="w-10 h-10 text-white/50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/80">Pending Payments</p>
                                    <p className="text-3xl font-bold">{stats?.pendingPayments || 0}</p>
                                </div>
                                <AlertCircle className="w-10 h-10 text-white/50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b">
                    {(['appointments', 'services'] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 font-medium capitalize transition-colors ${activeTab === tab
                                    ? 'text-purple-600 border-b-2 border-purple-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Appointments Tab */}
                {activeTab === 'appointments' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Appointments</h2>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-auto"
                            />
                        </div>

                        {appointments.length > 0 ? (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Time</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Customer</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Service</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Amount</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Payment</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {appointments.map((apt) => (
                                                <tr key={apt.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <span className="font-medium">{formatTime(apt.start_time)}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium">{(apt.users as any)?.full_name}</p>
                                                            <p className="text-sm text-gray-500">{(apt.users as any)?.phone}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">{(apt.services as any)?.service_name}</td>
                                                    <td className="px-6 py-4 font-semibold">{formatCurrency(apt.total_amount)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(apt.status)}`}>
                                                            {apt.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(apt.payment_status)}`}>
                                                                {apt.payment_status}
                                                            </span>
                                                            <div className="flex flex-col text-xs text-gray-500">
                                                                {apt.payment_confirmed_by_customer && <span className="text-green-600">✓ Customer confirmed</span>}
                                                                {apt.payment_confirmed_by_shop && <span className="text-green-600">✓ Shop confirmed</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {apt.status === 'pending' && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                                                                        disabled={actionLoading === apt.id}
                                                                    >
                                                                        {actionLoading === apt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                                                                        disabled={actionLoading === apt.id}
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {apt.status === 'confirmed' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="success"
                                                                    onClick={() => handleStatusUpdate(apt.id, 'completed')}
                                                                    disabled={actionLoading === apt.id}
                                                                >
                                                                    Complete
                                                                </Button>
                                                            )}
                                                            {apt.status === 'completed' && !apt.payment_confirmed_by_shop && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleConfirmPayment(apt.id)}
                                                                    disabled={actionLoading === apt.id}
                                                                >
                                                                    {actionLoading === apt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Payment'}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No appointments</h3>
                                    <p className="text-gray-600">No appointments scheduled for {formatDate(selectedDate)}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Services</h2>
                            <Button onClick={() => { setShowServiceForm(true); setEditingService(null); }}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Service
                            </Button>
                        </div>

                        {/* Service Form Modal */}
                        {showServiceForm && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>{editingService ? 'Edit Service' : 'Add New Service'}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleServiceSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="service_name">Service Name *</Label>
                                                <Input
                                                    id="service_name"
                                                    value={serviceForm.service_name}
                                                    onChange={(e) => setServiceForm({ ...serviceForm, service_name: e.target.value })}
                                                    required
                                                    placeholder="e.g., Haircut"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="category">Category</Label>
                                                <Input
                                                    id="category"
                                                    value={serviceForm.category}
                                                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                                                    placeholder="e.g., Hair, Beard, Facial"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="duration">Duration (minutes) *</Label>
                                                <Input
                                                    id="duration"
                                                    type="number"
                                                    value={serviceForm.duration_minutes}
                                                    onChange={(e) => setServiceForm({ ...serviceForm, duration_minutes: parseInt(e.target.value) })}
                                                    required
                                                    min={5}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="price">Price (₹) *</Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    value={serviceForm.price}
                                                    onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) })}
                                                    required
                                                    min={0}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Input
                                                id="description"
                                                value={serviceForm.description}
                                                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                                placeholder="Optional description"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={actionLoading === 'service'}>
                                                {actionLoading === 'service' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Service'}
                                            </Button>
                                            <Button type="button" variant="outline" onClick={() => { setShowServiceForm(false); setEditingService(null); }}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Services List */}
                        {services.length > 0 ? (
                            <div className="grid gap-4">
                                {services.map((service) => (
                                    <Card key={service.id}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                                        <Scissors className="w-6 h-6 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">{service.service_name}</h3>
                                                        <p className="text-sm text-gray-500">{service.duration_minutes} mins • {service.category || 'General'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xl font-bold">{formatCurrency(service.price)}</span>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="ghost" onClick={() => handleEditService(service)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => handleDeleteService(service.id)}
                                                            disabled={actionLoading === service.id}
                                                        >
                                                            {actionLoading === service.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No services yet</h3>
                                    <p className="text-gray-600 mb-4">Add your first service to start receiving bookings</p>
                                    <Button onClick={() => setShowServiceForm(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Service
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
