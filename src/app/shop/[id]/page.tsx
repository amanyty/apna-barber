'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, getShopById, getShopServices, getShopReviews, createAppointment } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Shop, Service, Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatTime, generateTimeSlots } from '@/lib/utils';
import {
    ArrowLeft, Star, Clock, MapPin, Phone, Mail, Calendar,
    Check, Scissors, User, Loader2, ChevronRight
} from 'lucide-react';

export default function ShopDetails() {
    const params = useParams();
    const router = useRouter();
    const shopId = params.id as string;
    const { user, userData } = useAuth();

    const [shop, setShop] = useState<Shop | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    // Booking state
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [customerNotes, setCustomerNotes] = useState('');
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [step, setStep] = useState(1); // 1: Select Service, 2: Select Date/Time, 3: Confirm

    useEffect(() => {
        loadShopData();
    }, [shopId]);

    useEffect(() => {
        if (shop) {
            const slots = generateTimeSlots(
                shop.opening_time || '09:00',
                shop.closing_time || '21:00',
                30
            );
            setTimeSlots(slots);
        }
    }, [shop]);

    const loadShopData = async () => {
        try {
            const [shopData, servicesData, reviewsData] = await Promise.all([
                getShopById(shopId),
                getShopServices(shopId),
                getShopReviews(shopId),
            ]);
            setShop(shopData);
            setServices(servicesData || []);
            setReviews(reviewsData || []);
        } catch (error) {
            console.error('Error loading shop:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!user || !selectedService || !selectedDate || !selectedTime) {
            return;
        }

        setBooking(true);
        try {
            await createAppointment({
                customer_id: user.id,
                shop_id: shopId,
                service_id: selectedService.id,
                appointment_date: selectedDate,
                start_time: selectedTime,
                total_amount: selectedService.price,
                customer_notes: customerNotes,
            });

            router.push('/dashboard?booked=true');
        } catch (error: any) {
            alert('Booking failed: ' + error.message);
        } finally {
            setBooking(false);
        }
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Shop not found</h2>
                    <Link href="/search">
                        <Button>Back to Search</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16">
                        <Link href="/search">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="ml-4 text-lg font-semibold truncate">{shop.shop_name}</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Shop Info & Services */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shop Header */}
                        <Card className="overflow-hidden">
                            <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600">
                                {shop.cover_image_url ? (
                                    <img
                                        src={shop.cover_image_url}
                                        alt={shop.shop_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Scissors className="w-24 h-24 text-white/30" />
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">{shop.shop_name}</h2>
                                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{shop.address}, {shop.city}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                                <span className="font-semibold">{shop.average_rating || 'New'}</span>
                                                <span className="text-gray-500">({shop.total_reviews || 0} reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                    {shop.opening_time && shop.closing_time && (
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                <span>{shop.opening_time.slice(0, 5)} - {shop.closing_time.slice(0, 5)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {shop.description && (
                                    <p className="mt-4 text-gray-600">{shop.description}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Services */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Scissors className="w-5 h-5" />
                                    Services
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {services.length > 0 ? (
                                    <div className="space-y-3">
                                        {services.map((service) => (
                                            <div
                                                key={service.id}
                                                onClick={() => { setSelectedService(service); setStep(2); }}
                                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedService?.id === service.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedService?.id === service.id ? 'bg-blue-500' : 'bg-gray-100'
                                                        }`}>
                                                        <Scissors className={`w-6 h-6 ${selectedService?.id === service.id ? 'text-white' : 'text-gray-500'
                                                            }`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{service.service_name}</p>
                                                        <p className="text-sm text-gray-500">{service.duration_minutes} mins</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-lg font-bold">{formatCurrency(service.price)}</p>
                                                    {selectedService?.id === service.id && (
                                                        <Check className="w-5 h-5 text-blue-500" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No services available yet.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Reviews */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="w-5 h-5" />
                                    Customer Reviews
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{(review.users as any)?.full_name || 'Customer'}</p>
                                                        <div className="flex items-center gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                {review.review_text && (
                                                    <p className="text-gray-600 ml-13">{review.review_text}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No reviews yet. Be the first!</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Booking */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Book Appointment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!user ? (
                                    <div className="text-center py-6">
                                        <p className="text-gray-600 mb-4">Please login to book an appointment</p>
                                        <Link href="/login">
                                            <Button className="w-full">Login to Book</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Step 1: Selected Service */}
                                        {selectedService && (
                                            <div className="bg-blue-50 rounded-xl p-4">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm text-blue-600 font-medium">Selected Service</p>
                                                        <p className="font-semibold">{selectedService.service_name}</p>
                                                    </div>
                                                    <p className="text-lg font-bold">{formatCurrency(selectedService.price)}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 2: Date & Time */}
                                        {step >= 2 && selectedService && (
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="date">Select Date</Label>
                                                    <Input
                                                        id="date"
                                                        type="date"
                                                        value={selectedDate}
                                                        onChange={(e) => setSelectedDate(e.target.value)}
                                                        min={getMinDate()}
                                                        className="mt-1"
                                                    />
                                                </div>

                                                {selectedDate && (
                                                    <div>
                                                        <Label>Select Time</Label>
                                                        <div className="grid grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto">
                                                            {timeSlots.map((slot) => (
                                                                <Button
                                                                    key={slot}
                                                                    variant={selectedTime === slot ? 'default' : 'outline'}
                                                                    size="sm"
                                                                    onClick={() => { setSelectedTime(slot); setStep(3); }}
                                                                    className="text-sm"
                                                                >
                                                                    {formatTime(slot)}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Step 3: Confirm */}
                                        {step >= 3 && selectedTime && (
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                                    <Input
                                                        id="notes"
                                                        value={customerNotes}
                                                        onChange={(e) => setCustomerNotes(e.target.value)}
                                                        placeholder="Any special requests..."
                                                        className="mt-1"
                                                    />
                                                </div>

                                                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Service</span>
                                                        <span className="font-medium">{selectedService?.service_name}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Date</span>
                                                        <span className="font-medium">{selectedDate}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Time</span>
                                                        <span className="font-medium">{formatTime(selectedTime)}</span>
                                                    </div>
                                                    <hr className="my-2" />
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Total</span>
                                                        <span className="font-bold text-lg">{formatCurrency(selectedService?.price || 0)}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        * Payment will be collected at the shop (Cash/UPI)
                                                    </p>
                                                </div>

                                                <Button
                                                    onClick={handleBooking}
                                                    disabled={booking}
                                                    className="w-full h-12 text-base"
                                                >
                                                    {booking ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                            Booking...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Confirm Booking
                                                            <ChevronRight className="w-5 h-5 ml-2" />
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        )}

                                        {!selectedService && (
                                            <p className="text-center text-gray-500 py-4">
                                                Select a service to continue
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}
