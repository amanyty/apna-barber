// Types for Apna Barber Application

export type UserType = 'customer' | 'barber';

export interface User {
    id: string;
    user_type: UserType;
    email: string;
    phone?: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
    is_admin?: boolean;
    created_at: string;
    updated_at: string;
}

export interface Shop {
    id: string;
    owner_id: string;
    shop_name: string;
    description?: string;
    logo_url?: string;
    cover_image_url?: string;
    address: string;
    latitude?: number;
    longitude?: number;
    city: string;
    state?: string;
    postal_code?: string;
    phone?: string;
    email?: string;
    website?: string;
    opening_time?: string;
    closing_time?: string;
    weekend_opening_time?: string;
    weekend_closing_time?: string;
    average_rating: number;
    total_reviews: number;
    total_appointments: number;
    is_verified: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Service {
    id: string;
    shop_id: string;
    service_name: string;
    description?: string;
    duration_minutes: number;
    price: number;
    category?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Barber {
    id: string;
    shop_id: string;
    user_id?: string;
    barber_name: string;
    specialization?: string;
    experience_years?: number;
    avatar_url?: string;
    average_rating: number;
    total_appointments: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Appointment {
    id: string;
    customer_id: string;
    shop_id: string;
    barber_id?: string;
    service_id: string;
    appointment_date: string;
    start_time: string;
    end_time?: string;
    status: AppointmentStatus;
    customer_notes?: string;
    admin_notes?: string;
    total_amount: number;
    payment_status: PaymentStatus;
    payment_confirmed_by_customer: boolean;
    payment_confirmed_by_shop: boolean;
    cancellation_reason?: string;
    cancelled_at?: string;
    reminder_sent: boolean;
    created_at: string;
    updated_at: string;
    // Joined data
    shops?: Shop;
    services?: Service;
    barbers?: Barber;
    users?: User;
}

export interface Review {
    id: string;
    appointment_id: string;
    customer_id: string;
    shop_id: string;
    barber_id?: string;
    rating: number;
    review_text?: string;
    images?: string[];
    is_verified_booking: boolean;
    helpful_count: number;
    created_at: string;
    updated_at: string;
    // Joined data
    users?: User;
}

export interface AvailabilitySlot {
    id: string;
    shop_id: string;
    barber_id?: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    break_start_time?: string;
    break_end_time?: string;
    max_appointments_per_day: number;
    is_available: boolean;
    created_at: string;
    updated_at: string;
}
