-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Drop existing tables
DROP TABLE IF EXISTS premium_history CASCADE;
DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS policies CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS knowledge_base CASCADE;

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
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
    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge base table for embeddings
CREATE TABLE knowledge_base (
    doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type VARCHAR(50) NOT NULL, -- faq, policy_doc, admin_note
    text_chunk TEXT NOT NULL,
    embedding VECTOR(384), -- using 384-dimensional vectors
    metadata JSONB, -- optional, e.g. {question: "Gold plan benefits", version: "2024"}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast similarity search
CREATE INDEX ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
