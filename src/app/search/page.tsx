'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, getAllShops, getShopsByCity } from '@/lib/supabase';
import { Shop } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, MapPin, Star, Clock, ArrowLeft, Filter, Scissors } from 'lucide-react';

export default function SearchPage() {
    const [city, setCity] = useState('');
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        loadAllShops();
    }, []);

    const loadAllShops = async () => {
        try {
            const data = await getAllShops();
            setShops(data || []);
        } catch (error) {
            console.error('Error loading shops:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!city.trim()) {
            loadAllShops();
            setSearched(false);
            return;
        }

        setLoading(true);
        setSearched(true);
        try {
            const data = await getShopsByCity(city);
            setShops(data || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>

                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Search by city..."
                                    className="pl-10 h-11"
                                />
                            </div>
                            <Button type="submit" className="h-11 px-6">
                                <Search className="w-5 h-5" />
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {searched ? `Barber Shops in "${city}"` : 'All Barber Shops'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {shops.length} {shops.length === 1 ? 'shop' : 'shops'} found
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-200" />
                                <div className="p-5 space-y-3">
                                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                    <div className="h-10 bg-gray-200 rounded" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : shops.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shops.map((shop) => (
                            <Link key={shop.id} href={`/shop/${shop.id}`}>
                                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
                                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                                        {shop.cover_image_url ? (
                                            <img
                                                src={shop.cover_image_url}
                                                alt={shop.shop_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Scissors className="w-16 h-16 text-white/50" />
                                            </div>
                                        )}
                                        {shop.is_verified && (
                                            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                                Verified
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                            {shop.shop_name}
                                        </h3>

                                        <div className="flex items-center gap-1 text-gray-600 mb-3">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm truncate">{shop.city}{shop.state ? `, ${shop.state}` : ''}</span>
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                                <span className="font-semibold">{shop.average_rating || 'New'}</span>
                                                <span className="text-gray-500 text-sm">({shop.total_reviews || 0})</span>
                                            </div>
                                            {shop.opening_time && shop.closing_time && (
                                                <div className="flex items-center gap-1 text-gray-500 text-sm">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{shop.opening_time.slice(0, 5)} - {shop.closing_time.slice(0, 5)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <Button className="w-full group-hover:bg-blue-700">
                                            Book Appointment
                                        </Button>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No shops found</h3>
                        <p className="text-gray-600 mb-6">
                            {searched
                                ? `We couldn't find any barber shops in "${city}". Try a different city.`
                                : 'No barber shops available yet. Check back soon!'
                            }
                        </p>
                        {searched && (
                            <Button onClick={() => { setCity(''); loadAllShops(); setSearched(false); }}>
                                View All Shops
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
