-- Migration 002: Add psychological / medical tracking columns to students table

ALTER TABLE students
    ADD COLUMN IF NOT EXISTS psychologist_registry JSONB DEFAULT '{"isRegistered":false,"registrationDate":"","grounds":"","responsible":"","preventiveWork":"","status":"","removalDate":"","removalGrounds":"","notes":""}',
    ADD COLUMN IF NOT EXISTS support_group JSONB DEFAULT '{"isMember":false,"groupName":"","joinDate":"","responsible":"","workDescription":"","result":"","exitDate":"","exitGrounds":""}',
    ADD COLUMN IF NOT EXISTS psychiatrist_registry JSONB DEFAULT '{"isRegistered":false,"organization":"","registrationDate":"","diagnosis":"","doctor":"","treatmentPlace":"","status":"","removalDate":"","notes":""}',
    ADD COLUMN IF NOT EXISTS cpp_accompaniment JSONB DEFAULT '{"isActive":false,"startDate":"","specialist":"","workType":"","goals":"","results":"","endDate":"","notes":""}',
    ADD COLUMN IF NOT EXISTS suicide_registry JSONB DEFAULT '{"hasFacts":false,"incidents":[]}';
