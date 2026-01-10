import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy-initialized Supabase client
let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
    if (!_supabase) {
        if (!supabaseUrl || !supabaseAnonKey) {
            // Return a mock client for build time - will throw on actual use
            console.warn('Supabase credentials not found. Some features may not work.');
            return {} as SupabaseClient;
        }
        _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return _supabase;
}

// Export as a proxy that lazily initializes
export const supabase = new Proxy({} as SupabaseClient, {
    get(target, prop) {
        const client = getSupabaseClient();
        const value = client[prop as keyof SupabaseClient];
        if (typeof value === 'function') {
            return value.bind(client);
        }
        return value;
    }
});

// Authentication helpers
export const signUp = async (email: string, password: string, userData: {
    full_name: string;
    phone?: string;
    user_type: 'customer' | 'barber';
}) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) throw error;

    if (data.user) {
        await supabase.from('users').insert({
            id: data.user.id,
            email,
            ...userData,
        });
    }

    return data;
};

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

export const getCurrentUserData = async (userId: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
};

// Shop queries
export const getShopsByCity = async (city: string) => {
    const { data, error } = await supabase
        .from('shops')
        .select('*')
        .ilike('city', `%${city}%`)
        .eq('is_active', true)
        .order('average_rating', { ascending: false });

    if (error) throw error;
    return data;
};

export const getAllShops = async () => {
    const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('is_active', true)
        .order('average_rating', { ascending: false });

    if (error) throw error;
    return data;
};

export const getShopById = async (shopId: string) => {
    const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();

    if (error) throw error;
    return data;
};

export const getShopByOwnerId = async (ownerId: string) => {
    const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', ownerId)
        .single();

    if (error) return null;
    return data;
};

export const createShop = async (shopData: {
    owner_id: string;
    shop_name: string;
    description?: string;
    address: string;
    city: string;
    state?: string;
    postal_code?: string;
    phone?: string;
    email?: string;
    opening_time?: string;
    closing_time?: string;
}) => {
    const { data, error } = await supabase
        .from('shops')
        .insert([shopData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Service queries
export const getShopServices = async (shopId: string) => {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('shop_id', shopId)
        .eq('is_active', true);

    if (error) throw error;
    return data;
};

export const createService = async (serviceData: {
    shop_id: string;
    service_name: string;
    description?: string;
    duration_minutes: number;
    price: number;
    category?: string;
}) => {
    const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateService = async (serviceId: string, updates: Partial<{
    service_name: string;
    description: string;
    duration_minutes: number;
    price: number;
    category: string;
    is_active: boolean;
}>) => {
    const { data, error } = await supabase
        .from('services')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', serviceId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteService = async (serviceId: string) => {
    const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', serviceId);

    if (error) throw error;
};

// Appointment queries
export const createAppointment = async (appointmentData: {
    customer_id: string;
    shop_id: string;
    service_id: string;
    barber_id?: string;
    appointment_date: string;
    start_time: string;
    total_amount: number;
    customer_notes?: string;
}) => {
    const { data, error } = await supabase
        .from('appointments')
        .insert([{
            ...appointmentData,
            status: 'pending',
            payment_status: 'pending',
            payment_confirmed_by_customer: false,
            payment_confirmed_by_shop: false,
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getCustomerAppointments = async (customerId: string) => {
    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      shops(*),
      services(*),
      barbers(*)
    `)
        .eq('customer_id', customerId)
        .order('appointment_date', { ascending: false });

    if (error) throw error;
    return data;
};

export const getShopAppointments = async (shopId: string, date?: string) => {
    let query = supabase
        .from('appointments')
        .select(`
      *,
      users:customer_id(*),
      services(*),
      barbers(*)
    `)
        .eq('shop_id', shopId);

    if (date) {
        query = query.eq('appointment_date', date);
    }

    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) throw error;
    return data;
};

export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    const { data, error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', appointmentId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const confirmPayment = async (appointmentId: string, confirmedBy: 'customer' | 'shop') => {
    const updateField = confirmedBy === 'customer'
        ? { payment_confirmed_by_customer: true }
        : { payment_confirmed_by_shop: true };

    const { data, error } = await supabase
        .from('appointments')
        .update({
            ...updateField,
            updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select()
        .single();

    if (error) throw error;

    // If both confirmed, update payment status to completed
    if (data.payment_confirmed_by_customer && data.payment_confirmed_by_shop) {
        await supabase
            .from('appointments')
            .update({ payment_status: 'completed' })
            .eq('id', appointmentId);
    }

    return data;
};

export const cancelAppointment = async (appointmentId: string, reason?: string) => {
    const { data, error } = await supabase
        .from('appointments')
        .update({
            status: 'cancelled',
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Review queries
export const submitReview = async (reviewData: {
    appointment_id: string;
    customer_id: string;
    shop_id: string;
    barber_id?: string;
    rating: number;
    review_text?: string;
}) => {
    const { data, error } = await supabase
        .from('reviews')
        .insert([{ ...reviewData, is_verified_booking: true }])
        .select()
        .single();

    if (error) throw error;

    // Update shop average rating
    await updateShopRating(reviewData.shop_id);

    return data;
};

export const getShopReviews = async (shopId: string) => {
    const { data, error } = await supabase
        .from('reviews')
        .select(`
      *,
      users:customer_id(full_name, avatar_url)
    `)
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

const updateShopRating = async (shopId: string) => {
    const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('shop_id', shopId);

    if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

        await supabase
            .from('shops')
            .update({
                average_rating: Math.round(avgRating * 10) / 10,
                total_reviews: reviews.length
            })
            .eq('id', shopId);
    }
};

// Analytics
export const getShopStats = async (shopId: string) => {
    const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('shop_id', shopId);

    if (!appointments) return null;

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.appointment_date === today);
    const completedAppointments = appointments.filter(a => a.status === 'completed');
    const totalRevenue = completedAppointments.reduce((sum, a) => sum + (a.total_amount || 0), 0);

    return {
        totalAppointments: appointments.length,
        todayAppointments: todayAppointments.length,
        completedAppointments: completedAppointments.length,
        totalRevenue,
        pendingPayments: appointments.filter(a => a.payment_status === 'pending').length,
    };
};
