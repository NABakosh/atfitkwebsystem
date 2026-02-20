-- Migration 001: Initialize database schema
-- Run this script once to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('director', 'psychologist')),
    display_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    birth_date VARCHAR(20),
    group_name VARCHAR(50),
    iin VARCHAR(12),
    previous_school TEXT,
    specialty TEXT,
    course VARCHAR(10),
    address TEXT,
    phone VARCHAR(20),
    photo_path VARCHAR(500),
    family JSONB DEFAULT '{"mother":{"fullName":"","workplace":"","phone":""},"father":{"fullName":"","workplace":"","phone":""},"guardian":{"fullName":"","relationship":"","phone":""},"familyType":"","childrenCount":0,"socialStatus":""}',
    internal_registry JSONB DEFAULT '{"registrationDate":"","grounds":[],"responsible":"","preventiveWork":"","result":"","status":"","removalDate":"","removalGrounds":""}',
    police_registry JSONB DEFAULT '{"isRegistered":false,"region":"","district":"","policeOrgan":"","registrationType":"","registrationDate":"","grounds":"","inspector":"","removalDate":"","removalGrounds":""}',
    consultations JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster search
CREATE INDEX IF NOT EXISTS idx_students_full_name ON students(full_name);
CREATE INDEX IF NOT EXISTS idx_students_group ON students(group_name);
