-- ============================================
-- APNA BARBER - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (customers and barbers)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_type VARCHAR(20) CHECK (user_type IN ('customer', 'barber')) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Barber shops table
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    address VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    opening_time TIME DEFAULT '09:00',
    closing_time TIME DEFAULT '21:00',
    weekend_opening_time TIME,
    weekend_closing_time TIME,
    holiday_schedule TEXT,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    total_appointments INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 30,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Barbers table (staff members)
CREATE TABLE IF NOT EXISTS barbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    barber_name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255),
    experience_years INT,
    avatar_url TEXT,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_appointments INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table (with offline payment confirmation fields)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    status VARCHAR(50) CHECK (status IN ('pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')) DEFAULT 'pending',
    customer_notes TEXT,
    admin_notes TEXT,
    total_amount DECIMAL(10, 2),
    payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    -- Offline payment confirmation fields
    payment_confirmed_by_customer BOOLEAN DEFAULT FALSE,
    payment_confirmed_by_shop BOOLEAN DEFAULT FALSE,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    review_text TEXT,
    images TEXT[],
    is_verified_booking BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Availability slots table
CREATE TABLE IF NOT EXISTS availability_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
    day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start_time TIME,
    break_end_time TIME,
    max_appointments_per_day INT DEFAULT 20,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_shops_city ON shops(city);
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_is_active ON shops(is_active);
CREATE INDEX IF NOT EXISTS idx_services_shop_id ON services(shop_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_shop_id ON appointments(shop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_reviews_shop_id ON reviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_availability_shop_id ON availability_slots(shop_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Shops policies
CREATE POLICY "Anyone can view active shops" ON shops FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can update own shops" ON shops FOR UPDATE USING (auth.uid()::text = owner_id::text);
CREATE POLICY "Owners can insert shops" ON shops FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);

-- Services policies
CREATE POLICY "Anyone can view active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Shop owners can manage services" ON services FOR ALL USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = services.shop_id AND shops.owner_id::text = auth.uid()::text)
);

-- Appointments policies
CREATE POLICY "Customers can view own appointments" ON appointments FOR SELECT USING (auth.uid()::text = customer_id::text);
CREATE POLICY "Shop owners can view shop appointments" ON appointments FOR SELECT USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = appointments.shop_id AND shops.owner_id::text = auth.uid()::text)
);
CREATE POLICY "Customers can insert appointments" ON appointments FOR INSERT WITH CHECK (auth.uid()::text = customer_id::text);
CREATE POLICY "Shop owners can update appointments" ON appointments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = appointments.shop_id AND shops.owner_id::text = auth.uid()::text)
);
CREATE POLICY "Customers can update own appointments" ON appointments FOR UPDATE USING (auth.uid()::text = customer_id::text);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Customers can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid()::text = customer_id::text);

-- Barbers policies
CREATE POLICY "Anyone can view barbers" ON barbers FOR SELECT USING (true);
CREATE POLICY "Shop owners can manage barbers" ON barbers FOR ALL USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = barbers.shop_id AND shops.owner_id::text = auth.uid()::text)
);

-- Availability policies
CREATE POLICY "Anyone can view availability" ON availability_slots FOR SELECT USING (true);
CREATE POLICY "Shop owners can manage availability" ON availability_slots FOR ALL USING (
    EXISTS (SELECT 1 FROM shops WHERE shops.id = availability_slots.shop_id AND shops.owner_id::text = auth.uid()::text)
);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
