-- ==========================================
-- 1. Create Database
-- ==========================================
CREATE DATABASE car_insurance;

-- Switch to the new database
\c car_insurance;

-- Enable UUID generator extension (for user IDs)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 2. Create Tables
-- ==========================================

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policies table
CREATE TABLE policies (
    policy_id VARCHAR(20) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plan_name VARCHAR(50) NOT NULL,
    collision_coverage INT NOT NULL,
    roadside_assistance BOOLEAN DEFAULT false,
    deductible INT NOT NULL,
    premium NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Claims table
CREATE TABLE claims (
    claim_id VARCHAR(10) PRIMARY KEY,
    policy_id VARCHAR(20) NOT NULL REFERENCES policies(policy_id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('Submitted', 'In Review', 'Approved', 'Rejected', 'Closed')) DEFAULT 'Submitted',
    damage_description TEXT NOT NULL,
    vehicle VARCHAR(100) NOT NULL,
    photos TEXT[], -- array of file paths or URLs
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Premium History table
CREATE TABLE premium_history (
    premium_id SERIAL PRIMARY KEY,
    policy_id VARCHAR(20) NOT NULL REFERENCES policies(policy_id) ON DELETE CASCADE,
    current_coverage INT NOT NULL,
    new_coverage INT NOT NULL,
    current_premium NUMERIC(10,2) NOT NULL,
    new_premium NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. Insert Sample Data
-- ==========================================

-- Users
INSERT INTO users (user_id, email, password_hash, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user@example.com', 'hashed_password_123', 'user'),
  ('22222222-2222-2222-2222-222222222222', 'admin@insure.com', 'hashed_password_admin', 'admin');

-- Policies
INSERT INTO policies (policy_id, user_id, plan_name, collision_coverage, roadside_assistance, deductible, premium)
VALUES
  ('POL-1001', '11111111-1111-1111-1111-111111111111', 'Gold', 50000, true, 500, 500.00),
  ('POL-1002', '11111111-1111-1111-1111-111111111111', 'Silver', 30000, false, 1000, 350.00);

-- Claims
INSERT INTO claims (claim_id, policy_id, status, damage_description, vehicle, photos, last_updated)
VALUES
  ('98765', 'POL-1001', 'In Review', 'Rear-end collision at traffic light', '2022 Toyota Camry', ARRAY['img_001.jpg','img_002.jpg'], '2024-12-01'),
  ('54321', 'POL-1001', 'Submitted', 'Side mirror damage in parking lot', '2022 Toyota Camry', ARRAY['img_003.jpg'], '2025-01-05');

-- Premium History
INSERT INTO premium_history (policy_id, current_coverage, new_coverage, current_premium, new_premium)
VALUES
  ('POL-1001', 50000, 80000, 500.00, 760.00),
  ('POL-1002', 30000, 60000, 350.00, 520.00);

-- ==========================================
--  Done 🚀
-- ==========================================
