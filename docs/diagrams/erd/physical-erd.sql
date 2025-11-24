-- ============================================================
-- PHYSICAL ERD - PostgreSQL Database Schema
-- EV Co-ownership & Cost-sharing System
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- ============================================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('co_owner', 'staff', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Vietnam',
    avatar_url VARCHAR(500),
    id_card_number VARCHAR(50),
    driver_license_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Email verifications table
CREATE TABLE email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);

-- Password resets table
CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_token ON password_resets(token);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- KYC verifications table
CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('id_card', 'passport', 'driver_license')),
    document_number VARCHAR(100),
    document_front_url VARCHAR(500),
    document_back_url VARCHAR(500),
    selfie_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'resubmit_required')),
    rejection_reason TEXT,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kyc_verifications_user_id ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_verifications_status ON kyc_verifications(status);

-- Staff profiles table
CREATE TABLE staff_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE,
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_profiles_user_id ON staff_profiles(user_id);
CREATE INDEX idx_staff_profiles_employee_id ON staff_profiles(employee_id);

-- ============================================================
-- 2. GROUP & MEMBERSHIP MANAGEMENT
-- ============================================================

-- Co-ownership groups table
CREATE TABLE co_ownership_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    group_fund_balance DECIMAL(15,2) DEFAULT 0 CHECK (group_fund_balance >= 0),
    vehicle_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_co_ownership_groups_created_by ON co_ownership_groups(created_by);
CREATE INDEX idx_co_ownership_groups_vehicle_id ON co_ownership_groups(vehicle_id);
CREATE INDEX idx_co_ownership_groups_is_active ON co_ownership_groups(is_active);

-- Group members table
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES co_ownership_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ownership_percentage DECIMAL(5,2) NOT NULL CHECK (ownership_percentage BETWEEN 0.01 AND 100),
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'member', 'viewer')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_is_active ON group_members(is_active);

-- Group fund transactions table
CREATE TABLE group_fund_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES co_ownership_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'allocation', 'refund')),
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_group_fund_transactions_group_id ON group_fund_transactions(group_id);
CREATE INDEX idx_group_fund_transactions_user_id ON group_fund_transactions(user_id);
CREATE INDEX idx_group_fund_transactions_created_at ON group_fund_transactions(created_at);

-- ============================================================
-- 3. VEHICLE MANAGEMENT
-- ============================================================

-- Vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES co_ownership_groups(id) ON DELETE RESTRICT,
    vehicle_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER CHECK (year >= 2000 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(17) UNIQUE,
    color VARCHAR(50),
    battery_capacity_kwh DECIMAL(6,2) CHECK (battery_capacity_kwh BETWEEN 10 AND 200),
    current_odometer INTEGER DEFAULT 0 CHECK (current_odometer >= 0),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'unavailable', 'retired')),
    purchase_date DATE,
    purchase_price DECIMAL(15,2),
    images JSONB DEFAULT '[]',
    specifications JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_group_id ON vehicles(group_id);
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- Maintenance schedules table
CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL,
    scheduled_date DATE NOT NULL,
    odometer_at_schedule INTEGER,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_schedules_vehicle_id ON maintenance_schedules(vehicle_id);
CREATE INDEX idx_maintenance_schedules_scheduled_date ON maintenance_schedules(scheduled_date);
CREATE INDEX idx_maintenance_schedules_status ON maintenance_schedules(status);

-- Maintenance history table
CREATE TABLE maintenance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES maintenance_schedules(id) ON DELETE SET NULL,
    maintenance_type VARCHAR(50) NOT NULL,
    description TEXT,
    cost DECIMAL(15,2),
    odometer INTEGER,
    performed_by VARCHAR(255),
    performed_at TIMESTAMP NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_history_vehicle_id ON maintenance_history(vehicle_id);
CREATE INDEX idx_maintenance_history_performed_at ON maintenance_history(performed_at);

-- Vehicle insurance table
CREATE TABLE vehicle_insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    provider VARCHAR(255) NOT NULL,
    policy_number VARCHAR(100) UNIQUE NOT NULL,
    coverage_type VARCHAR(50),
    premium_amount DECIMAL(15,2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    documents JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date > start_date)
);

CREATE INDEX idx_vehicle_insurance_vehicle_id ON vehicle_insurance(vehicle_id);
CREATE INDEX idx_vehicle_insurance_end_date ON vehicle_insurance(end_date);
CREATE INDEX idx_vehicle_insurance_is_active ON vehicle_insurance(is_active);

-- Charging sessions table
CREATE TABLE charging_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    location VARCHAR(255),
    start_battery_percentage DECIMAL(5,2),
    end_battery_percentage DECIMAL(5,2),
    energy_added_kwh DECIMAL(8,2),
    cost DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'interrupted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE INDEX idx_charging_sessions_vehicle_id ON charging_sessions(vehicle_id);
CREATE INDEX idx_charging_sessions_user_id ON charging_sessions(user_id);
CREATE INDEX idx_charging_sessions_start_time ON charging_sessions(start_time);

-- ============================================================
-- 4. BOOKING & SCHEDULING
-- ============================================================

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    group_id UUID NOT NULL REFERENCES co_ownership_groups(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'conflict')),
    priority_score INTEGER DEFAULT 0,
    purpose VARCHAR(500),
    destination VARCHAR(500),
    estimated_distance DECIMAL(10,2),
    actual_distance DECIMAL(10,2),
    efficiency DECIMAL(5,2),
    cost DECIMAL(15,2),
    notes TEXT,
    cancellation_reason TEXT,
    auto_confirmed BOOLEAN DEFAULT FALSE,
    qr_code_check_in TEXT,
    qr_code_check_out TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_time > start_time)
);

CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_group_id ON bookings(group_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_time_range ON bookings USING GIST (tsrange(start_time, end_time));

-- Check-in/out logs table
CREATE TABLE check_in_out_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    log_type VARCHAR(10) NOT NULL CHECK (log_type IN ('check_in', 'check_out')),
    odometer INTEGER,
    battery_percentage DECIMAL(5,2),
    photos JSONB DEFAULT '[]',
    notes TEXT,
    issues_reported TEXT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_check_in_out_logs_booking_id ON check_in_out_logs(booking_id);
CREATE INDEX idx_check_in_out_logs_vehicle_id ON check_in_out_logs(vehicle_id);
CREATE INDEX idx_check_in_out_logs_logged_at ON check_in_out_logs(logged_at);

-- Booking conflicts table
CREATE TABLE booking_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id_1 UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    booking_id_2 UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    conflict_type VARCHAR(20) NOT NULL CHECK (conflict_type IN ('full', 'partial')),
    resolution_status VARCHAR(20) DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'negotiating', 'resolved', 'escalated')),
    resolved_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (booking_id_1 != booking_id_2)
);

CREATE INDEX idx_booking_conflicts_booking_1 ON booking_conflicts(booking_id_1);
CREATE INDEX idx_booking_conflicts_booking_2 ON booking_conflicts(booking_id_2);
CREATE INDEX idx_booking_conflicts_status ON booking_conflicts(resolution_status);

-- Calendar cache table (for performance)
CREATE TABLE calendar_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    cache_date DATE NOT NULL,
    cache_data JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vehicle_id, cache_date)
);

CREATE INDEX idx_calendar_cache_vehicle_date ON calendar_cache(vehicle_id, cache_date);
CREATE INDEX idx_calendar_cache_expires_at ON calendar_cache(expires_at);

-- ============================================================
-- 5. COST MANAGEMENT
-- ============================================================

-- Cost categories table
CREATE TABLE cost_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Costs table
CREATE TABLE costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES co_ownership_groups(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES cost_categories(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    cost_name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount >= 0),
    split_type VARCHAR(20) DEFAULT 'ownership_ratio' CHECK (split_type IN ('ownership_ratio', 'usage_based', 'equal', 'custom')),
    cost_date DATE NOT NULL,
    description TEXT,
    invoice_url VARCHAR(500),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    invoiced BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_costs_group_id ON costs(group_id);
CREATE INDEX idx_costs_vehicle_id ON costs(vehicle_id);
CREATE INDEX idx_costs_booking_id ON costs(booking_id);
CREATE INDEX idx_costs_cost_date ON costs(cost_date);
CREATE INDEX idx_costs_created_by ON costs(created_by);

-- Cost splits table
CREATE TABLE cost_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cost_id UUID NOT NULL REFERENCES costs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    split_percentage DECIMAL(5,2) NOT NULL CHECK (split_percentage BETWEEN 0 AND 100),
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'waived')),
    paid_at TIMESTAMP,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cost_id, user_id)
);

CREATE INDEX idx_cost_splits_cost_id ON cost_splits(cost_id);
CREATE INDEX idx_cost_splits_user_id ON cost_splits(user_id);
CREATE INDEX idx_cost_splits_status ON cost_splits(status);
CREATE INDEX idx_cost_splits_due_date ON cost_splits(due_date);

-- ============================================================
-- 6. PAYMENT & WALLET
-- ============================================================

-- User wallets table
CREATE TABLE user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15,2) DEFAULT 0 CHECK (balance >= 0),
    currency VARCHAR(10) DEFAULT 'VND',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);

-- Group wallets table
CREATE TABLE group_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID UNIQUE NOT NULL REFERENCES co_ownership_groups(id) ON DELETE CASCADE,
    balance DECIMAL(15,2) DEFAULT 0 CHECK (balance >= 0),
    currency VARCHAR(10) DEFAULT 'VND',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_group_wallets_group_id ON group_wallets(group_id);

-- Wallet transactions table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES user_wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'payment', 'refund', 'transfer')),
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    group_id UUID NOT NULL REFERENCES co_ownership_groups(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'paid', 'partially_paid', 'overdue', 'cancelled')),
    due_date DATE,
    issued_at TIMESTAMP,
    paid_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_group_id ON invoices(group_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Invoice items table
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    cost_id UUID REFERENCES costs(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_cost_id ON invoice_items(cost_id);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    cost_split_id UUID REFERENCES cost_splits(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('vnpay', 'momo', 'zalopay', 'bank_transfer', 'cash', 'wallet')),
    transaction_id VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    payment_data JSONB,
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_cost_split_id ON payments(cost_split_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- 7. CONTRACT MANAGEMENT
-- ============================================================

-- Contract templates table
CREATE TABLE contract_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    content_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contracts table
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES co_ownership_groups(id) ON DELETE RESTRICT,
    contract_type VARCHAR(20) NOT NULL CHECK (contract_type IN ('co_ownership', 'amendment', 'termination', 'renewal')),
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signatures', 'active', 'expired', 'terminated', 'executed')),
    effective_date DATE,
    expiry_date DATE,
    auto_renew BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    parent_contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    template_id UUID REFERENCES contract_templates(id) ON DELETE SET NULL,
    activated_at TIMESTAMP,
    terminated_at TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (expiry_date IS NULL OR expiry_date > effective_date)
);

CREATE INDEX idx_contracts_group_id ON contracts(group_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_expiry_date ON contracts(expiry_date);
CREATE INDEX idx_contracts_contract_number ON contracts(contract_number);

-- Contract parties table
CREATE TABLE contract_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    party_type VARCHAR(20) DEFAULT 'signatory' CHECK (party_type IN ('signatory', 'witness', 'guarantor')),
    signature_required BOOLEAN DEFAULT TRUE,
    signed_at TIMESTAMP,
    signature_data TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contract_id, user_id, party_type)
);

CREATE INDEX idx_contract_parties_contract_id ON contract_parties(contract_id);
CREATE INDEX idx_contract_parties_user_id ON contract_parties(user_id);

-- Contract documents table
CREATE TABLE contract_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('pdf', 'signed_pdf', 'attachment', 'amendment')),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contract_documents_contract_id ON contract_documents(contract_id);

-- Contract amendments table
CREATE TABLE contract_amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    amendment_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    changes JSONB NOT NULL,
    effective_date DATE NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contract_id, amendment_number)
);

CREATE INDEX idx_contract_amendments_contract_id ON contract_amendments(contract_id);

-- Signature logs table
CREATE TABLE signature_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(20) NOT NULL CHECK (action IN ('signed', 'viewed', 'downloaded', 'declined')),
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_signature_logs_contract_id ON signature_logs(contract_id);
CREATE INDEX idx_signature_logs_user_id ON signature_logs(user_id);
CREATE INDEX idx_signature_logs_created_at ON signature_logs(created_at);

-- ============================================================
-- 8. VOTING SYSTEM
-- ============================================================

-- Group votes table
CREATE TABLE group_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES co_ownership_groups(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('simple_majority', 'supermajority', 'unanimous', 'weighted')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'approved', 'rejected', 'tied')),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NOT NULL,
    result VARCHAR(20),
    result_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_time > start_time)
);

CREATE INDEX idx_group_votes_group_id ON group_votes(group_id);
CREATE INDEX idx_group_votes_status ON group_votes(status);
CREATE INDEX idx_group_votes_end_time ON group_votes(end_time);

-- Vote options table
CREATE TABLE vote_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vote_id UUID NOT NULL REFERENCES group_votes(id) ON DELETE CASCADE,
    option_text VARCHAR(255) NOT NULL,
    option_order INTEGER DEFAULT 0,
    votes_count INTEGER DEFAULT 0,
    votes_weight DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vote_options_vote_id ON vote_options(vote_id);

-- User votes table
CREATE TABLE user_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vote_id UUID NOT NULL REFERENCES group_votes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES vote_options(id) ON DELETE CASCADE,
    voting_weight DECIMAL(10,2) NOT NULL,
    comment TEXT,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vote_id, user_id)
);

CREATE INDEX idx_user_votes_vote_id ON user_votes(vote_id);
CREATE INDEX idx_user_votes_user_id ON user_votes(user_id);
CREATE INDEX idx_user_votes_option_id ON user_votes(option_id);

-- ============================================================
-- 9. DISPUTE MANAGEMENT
-- ============================================================

-- Disputes table
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_number VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    dispute_type VARCHAR(20) NOT NULL CHECK (dispute_type IN ('booking_conflict', 'cost_dispute', 'damage_claim', 'contract_breach', 'other')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed', 'escalated')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    filed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    against_user UUID REFERENCES users(id) ON DELETE SET NULL,
    group_id UUID NOT NULL REFERENCES co_ownership_groups(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disputes_dispute_number ON disputes(dispute_number);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_priority ON disputes(priority);
CREATE INDEX idx_disputes_assigned_to ON disputes(assigned_to);
CREATE INDEX idx_disputes_filed_by ON disputes(filed_by);
CREATE INDEX idx_disputes_group_id ON disputes(group_id);

-- Dispute messages table
CREATE TABLE dispute_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dispute_messages_dispute_id ON dispute_messages(dispute_id);
CREATE INDEX idx_dispute_messages_sender_id ON dispute_messages(sender_id);
CREATE INDEX idx_dispute_messages_created_at ON dispute_messages(created_at);

-- ============================================================
-- 10. NOTIFICATION SYSTEM
-- ============================================================

-- Notification templates table
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'push', 'sms', 'in_app')),
    subject VARCHAR(255),
    body_text TEXT,
    body_html TEXT,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_templates_type ON notification_templates(type);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'push', 'sms', 'in_app')),
    title VARCHAR(255),
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    failed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Device tokens table
CREATE TABLE device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('ios', 'android', 'web')),
    token VARCHAR(500) UNIQUE NOT NULL,
    device_info JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_token ON device_tokens(token);
CREATE INDEX idx_device_tokens_is_active ON device_tokens(is_active);

-- ============================================================
-- 11. AI RECOMMENDATION SYSTEM
-- ============================================================

-- Recommendations table
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES co_ownership_groups(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('fairness', 'schedule', 'cost_optimization', 'maintenance')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    suggestions JSONB NOT NULL,
    fairness_score_before DECIMAL(5,2),
    fairness_score_after DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    applied_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_group_id ON recommendations(group_id);
CREATE INDEX idx_recommendations_type ON recommendations(recommendation_type);
CREATE INDEX idx_recommendations_status ON recommendations(status);

-- Usage logs table (for AI training)
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    group_id UUID REFERENCES co_ownership_groups(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    log_type VARCHAR(50) NOT NULL,
    log_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_group_id ON usage_logs(group_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);

-- ============================================================
-- 12. ADMIN & AUDIT
-- ============================================================

-- System settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    data_type VARCHAR(20) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_settings_key ON system_settings(setting_key);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_co_ownership_groups_updated_at BEFORE UPDATE ON co_ownership_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_members_updated_at BEFORE UPDATE ON group_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_costs_updated_at BEFORE UPDATE ON costs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.invoice_number = 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq;

CREATE TRIGGER generate_invoice_number_trigger BEFORE INSERT ON invoices
    FOR EACH ROW WHEN (NEW.invoice_number IS NULL)
    EXECUTE FUNCTION generate_invoice_number();

-- Function to generate unique dispute number
CREATE OR REPLACE FUNCTION generate_dispute_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.dispute_number = 'DSP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('dispute_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS dispute_number_seq;

CREATE TRIGGER generate_dispute_number_trigger BEFORE INSERT ON disputes
    FOR EACH ROW WHEN (NEW.dispute_number IS NULL)
    EXECUTE FUNCTION generate_dispute_number();

-- ============================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================

-- View: Active bookings with user and vehicle info
CREATE OR REPLACE VIEW v_active_bookings AS
SELECT 
    b.id,
    b.start_time,
    b.end_time,
    b.status,
    b.priority_score,
    u.email AS user_email,
    up.full_name AS user_name,
    v.vehicle_name,
    v.license_plate,
    g.group_name
FROM bookings b
JOIN users u ON b.user_id = u.id
LEFT JOIN user_profiles up ON u.id = up.user_id
JOIN vehicles v ON b.vehicle_id = v.id
JOIN co_ownership_groups g ON b.group_id = g.id
WHERE b.status IN ('confirmed', 'in_progress');

-- View: Cost splits with payment status
CREATE OR REPLACE VIEW v_cost_splits_summary AS
SELECT 
    cs.id,
    cs.cost_id,
    c.cost_name,
    c.total_amount AS cost_total,
    cs.user_id,
    u.email,
    up.full_name,
    cs.amount,
    cs.split_percentage,
    cs.status,
    cs.due_date,
    CASE 
        WHEN cs.status = 'paid' THEN 'Đã thanh toán'
        WHEN cs.status = 'overdue' THEN 'Quá hạn'
        ELSE 'Chưa thanh toán'
    END AS status_vn
FROM cost_splits cs
JOIN costs c ON cs.cost_id = c.id
JOIN users u ON cs.user_id = u.id
LEFT JOIN user_profiles up ON u.id = up.user_id;

-- View: Group ownership summary
CREATE OR REPLACE VIEW v_group_ownership_summary AS
SELECT 
    g.id AS group_id,
    g.group_name,
    COUNT(gm.id) AS member_count,
    SUM(gm.ownership_percentage) AS total_ownership,
    v.vehicle_name,
    v.license_plate
FROM co_ownership_groups g
LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.is_active = TRUE
LEFT JOIN vehicles v ON g.vehicle_id = v.id
WHERE g.is_active = TRUE
GROUP BY g.id, g.group_name, v.vehicle_name, v.license_plate;

-- ============================================================
-- INITIAL DATA
-- ============================================================

-- Insert default cost categories
INSERT INTO cost_categories (name, description, is_system, is_active) VALUES
('Điện năng', 'Chi phí sạc điện', TRUE, TRUE),
('Bảo dưỡng', 'Chi phí bảo dưỡng định kỳ', TRUE, TRUE),
('Sửa chữa', 'Chi phí sửa chữa', TRUE, TRUE),
('Bảo hiểm', 'Chi phí bảo hiểm xe', TRUE, TRUE),
('Đăng kiểm', 'Chi phí đăng kiểm', TRUE, TRUE),
('Gửi xe', 'Chi phí gửi xe', TRUE, TRUE),
('Phạt nguội', 'Chi phí phạt vi phạm giao thông', TRUE, TRUE),
('Khác', 'Chi phí khác', TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
