'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
    getAdminStats,
    getAllShopsAdmin,
    getAllUsers,
    toggleShopStatus,
    deleteUser
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Store, Users, DollarSign, Calendar, CheckCircle, XCircle, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [shops, setShops] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user || !isAdmin) {
                router.push('/login');
            } else {
                fetchData();
            }
        }
    }, [user, isAdmin, authLoading, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, shopsData, usersData] = await Promise.all([
                getAdminStats(),
                getAllShopsAdmin(),
                getAllUsers()
            ]);
            setStats(statsData);
            setShops(shopsData);
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleShop = async (shopId: string, currentStatus: boolean) => {
        if (confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this shop?`)) {
            try {
                await toggleShopStatus(shopId, !currentStatus);
                // Optimistic update
                setShops(shops.map(shop =>
                    shop.id === shopId ? { ...shop, is_active: !currentStatus } : shop
                ));
            } catch (error) {
                console.error('Error updating shop status:', error);
                alert('Failed to update shop status');
            }
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all associated data.')) {
            try {
                await deleteUser(userId);
                setUsers(users.filter(u => u.id !== userId));
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user');
            }
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500">Manage your platform, users, and shops.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">
                            Logged in as Admin
                        </span>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 max-w-md bg-white p-1 rounded-xl shadow-sm border">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="shops">Shops</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">₹{stats?.totalRevenue?.toLocaleString()}</div>
                                    <p className="text-xs text-gray-500 mt-1">Platform-wide earnings</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Total Bookings</CardTitle>
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats?.totalAppointments}</div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        <span className="text-green-500 font-medium">+{stats?.todayBookings}</span> today
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Active Shops</CardTitle>
                                    <Store className="h-4 w-4 text-purple-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats?.totalShops}</div>
                                    <p className="text-xs text-gray-500 mt-1">Registered partners</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
                                    <Users className="h-4 w-4 text-orange-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                                    <p className="text-xs text-gray-500 mt-1">Customers & Barbers</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* SHOPS TAB */}
                    <TabsContent value="shops">
                        <Card className="border-0 shadow-md">
                            <CardHeader>
                                <CardTitle>Manage Shops</CardTitle>
                                <CardDescription>View, activate, or suspend barber shops.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                                <tr>
                                                    <th className="px-6 py-3 font-medium">Shop Name</th>
                                                    <th className="px-6 py-3 font-medium">Owner</th>
                                                    <th className="px-6 py-3 font-medium">Location</th>
                                                    <th className="px-6 py-3 font-medium">Rating</th>
                                                    <th className="px-6 py-3 font-medium">Status</th>
                                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {shops.map((shop) => (
                                                    <tr key={shop.id} className="bg-white hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900">
                                                            {shop.shop_name}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500">
                                                            {shop.users?.full_name || 'Unknown'}
                                                            <div className="text-xs text-gray-400">{shop.users?.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500">
                                                            {shop.city}, {shop.state}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                ★ {shop.average_rating || 0}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={cn(
                                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                                shop.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                            )}>
                                                                {shop.is_active ? 'Active' : 'Suspended'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right space-x-2">
                                                            <Link href={`/shop/${shop.id}`} target="_blank">
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant={shop.is_active ? "destructive" : "default"} // Green for activate not standard, used default
                                                                size="sm"
                                                                className={cn("h-8", !shop.is_active && "bg-green-600 hover:bg-green-700")}
                                                                onClick={() => handleToggleShop(shop.id, shop.is_active)}
                                                            >
                                                                {shop.is_active ? 'Suspend' : 'Activate'}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* USERS TAB */}
                    <TabsContent value="users">
                        <Card className="border-0 shadow-md">
                            <CardHeader>
                                <CardTitle>Manage Users</CardTitle>
                                <CardDescription>View and manage all registered accounts.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                                <tr>
                                                    <th className="px-6 py-3 font-medium">User</th>
                                                    <th className="px-6 py-3 font-medium">Role</th>
                                                    <th className="px-6 py-3 font-medium">Joined</th>
                                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {users.map((u) => (
                                                    <tr key={u.id} className="bg-white hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-gray-900">{u.full_name}</div>
                                                            <div className="text-gray-500 text-xs">{u.email}</div>
                                                            <div className="text-gray-400 text-xs">{u.phone}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-2">
                                                                <span className={cn(
                                                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                                                    u.user_type === 'barber' ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                                                                )}>
                                                                    {u.user_type}
                                                                </span>
                                                                {u.is_admin && (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-white">
                                                                        Admin
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500">
                                                            {new Date(u.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {!u.is_admin && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => handleDeleteUser(u.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
