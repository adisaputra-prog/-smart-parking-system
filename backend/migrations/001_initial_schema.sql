BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel cabang/lokasi parkir
CREATE TABLE branches (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    address     TEXT,
    city        VARCHAR(50),
    total_slots INTEGER NOT NULL DEFAULT 100,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel tarif parkir per jenis kendaraan
CREATE TABLE tariffs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id       UUID NOT NULL REFERENCES branches(id),
    vehicle_type    VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('motor', 'mobil', 'truk')),
    first_hour_fee  INTEGER NOT NULL DEFAULT 3000,
    next_hour_fee   INTEGER NOT NULL DEFAULT 2000,
    daily_max_fee   INTEGER NOT NULL DEFAULT 50000,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(branch_id, vehicle_type)
);

-- Tabel user sistem (admin, operator, kasir)
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id     UUID REFERENCES branches(id),
    username      VARCHAR(50) UNIQUE NOT NULL,
    email         VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(100) NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'operator'
                    CHECK (role IN ('superadmin', 'admin', 'operator', 'cashier')),
    is_active     BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel gate / palang pintu
CREATE TABLE gates (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id    UUID NOT NULL REFERENCES branches(id),
    name         VARCHAR(50) NOT NULL,
    direction    VARCHAR(10) NOT NULL CHECK (direction IN ('entry', 'exit', 'both')),
    device_token VARCHAR(255) UNIQUE,
    is_online    BOOLEAN NOT NULL DEFAULT false,
    last_ping_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel tiket parkir (inti sistem)
CREATE TABLE parking_tickets (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_code    VARCHAR(20) UNIQUE NOT NULL,
    branch_id      UUID NOT NULL REFERENCES branches(id),
    plate_number   VARCHAR(15) NOT NULL,
    vehicle_type   VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('motor', 'mobil', 'truk')),
    entry_time     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    exit_time      TIMESTAMPTZ,
    duration_mins  INTEGER,
    fee_amount     INTEGER,
    status         VARCHAR(20) NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'completed', 'lost', 'voided')),
    qr_code_hash   VARCHAR(255) UNIQUE NOT NULL,
    gate_entry_id  UUID REFERENCES gates(id),
    gate_exit_id   UUID REFERENCES gates(id),
    operator_entry UUID REFERENCES users(id),
    operator_exit  UUID REFERENCES users(id),
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel audit log (semua aksi tercatat)
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id),
    action      VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id   UUID,
    ip_address  INET,
    user_agent  TEXT,
    old_values  JSONB,
    new_values  JSONB,
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX idx_tickets_plate      ON parking_tickets(plate_number);
CREATE INDEX idx_tickets_status     ON parking_tickets(status);
CREATE INDEX idx_tickets_entry_time ON parking_tickets(entry_time);
CREATE INDEX idx_tickets_branch     ON parking_tickets(branch_id);
CREATE INDEX idx_audit_user         ON audit_logs(user_id);
CREATE INDEX idx_audit_created      ON audit_logs(created_at);
CREATE INDEX idx_audit_action       ON audit_logs(action);

-- Data awal
INSERT INTO branches (id, name, address, city, total_slots) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Cabang Utama', 'Jl. Sudirman No.1', 'Jakarta', 200);

INSERT INTO tariffs (branch_id, vehicle_type, first_hour_fee, next_hour_fee, daily_max_fee) VALUES
    ('00000000-0000-0000-0000-000000000001', 'motor', 3000, 2000, 20000),
    ('00000000-0000-0000-0000-000000000001', 'mobil', 5000, 3000, 50000),
    ('00000000-0000-0000-0000-000000000001', 'truk', 10000, 7000, 100000);

-- Password default: Admin@1234
INSERT INTO users (branch_id, username, email, password_hash, full_name, role) VALUES
    ('00000000-0000-0000-0000-000000000001',
     'superadmin',
     'admin@smartparking.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NJsZe8BfK',
     'Super Administrator',
     'superadmin');

INSERT INTO gates (branch_id, name, direction, device_token) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Gate A - Masuk', 'entry', 'gate-token-entry-001'),
    ('00000000-0000-0000-0000-000000000001', 'Gate B - Keluar', 'exit',  'gate-token-exit-001');

COMMIT;