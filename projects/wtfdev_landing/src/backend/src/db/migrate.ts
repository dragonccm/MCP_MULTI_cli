import { query } from "../config/database.js";

const MIGRATION_SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS contact_inquiry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    service_interest VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'contacted', 'closed'))
);

CREATE TABLE IF NOT EXISTS newsletter_subscriber (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    source VARCHAR(50) DEFAULT 'website'
);

CREATE TABLE IF NOT EXISTS portfolio_project (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    thumbnail_url VARCHAR(500),
    gallery_urls JSONB DEFAULT '[]'::jsonb,
    client_name VARCHAR(255),
    technologies JSONB DEFAULT '[]'::jsonb,
    outcome TEXT,
    published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    short_description VARCHAR(255) NOT NULL,
    full_description TEXT NOT NULL,
    icon_url VARCHAR(500),
    features JSONB DEFAULT '[]'::jsonb,
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_ci_email ON contact_inquiry(email);
CREATE INDEX IF NOT EXISTS idx_ci_status ON contact_inquiry(status);
CREATE INDEX IF NOT EXISTS idx_ci_created_at ON contact_inquiry(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ns_email ON newsletter_subscriber(email);

CREATE INDEX IF NOT EXISTS idx_pp_category ON portfolio_project(category);
CREATE INDEX IF NOT EXISTS idx_pp_published ON portfolio_project(published) WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_svc_slug ON service(slug);
CREATE INDEX IF NOT EXISTS idx_svc_active ON service(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_svc_order ON service(display_order);

-- Fix defaults for existing tables
ALTER TABLE contact_inquiry ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE newsletter_subscriber ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE portfolio_project ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE service ALTER COLUMN id SET DEFAULT gen_random_uuid();
`;

export async function migrate(): Promise<void> {
  console.info("Running database migrations...");
  try {
    await query(MIGRATION_SQL);
    console.info("Migrations completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

const isMainModule = process.argv[1]?.includes("migrate");
if (isMainModule) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
