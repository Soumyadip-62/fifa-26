CREATE TABLE IF NOT EXISTS football_catalog (
  id uuid PRIMARY KEY, kind text NOT NULL CHECK (kind IN ('teams','players','stadiums')),
  "providerKey" text NOT NULL, payload jsonb NOT NULL, "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE(kind, "providerKey")
);
CREATE TABLE IF NOT EXISTS football_aliases (
  kind text NOT NULL, alias text NOT NULL, "entityId" uuid NOT NULL REFERENCES football_catalog(id),
  PRIMARY KEY(kind, alias)
);
CREATE TABLE IF NOT EXISTS football_memberships (
  "entityId" uuid NOT NULL REFERENCES football_catalog(id), "competitionId" text NOT NULL,
  season integer NOT NULL, "teamId" uuid REFERENCES football_catalog(id),
  PRIMARY KEY("entityId", "competitionId", season)
);
CREATE INDEX IF NOT EXISTS football_memberships_competition ON football_memberships("competitionId", season);
CREATE TABLE IF NOT EXISTS football_history (year integer PRIMARY KEY, payload jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS football_devices (
  id uuid PRIMARY KEY, "secretHash" text NOT NULL, token text UNIQUE, preferences jsonb NOT NULL,
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS football_deliveries (
  id text PRIMARY KEY, "deviceId" uuid NOT NULL REFERENCES football_devices(id) ON DELETE CASCADE,
  "matchId" text NOT NULL, event text NOT NULL, kickoff timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending', attempts integer NOT NULL DEFAULT 0,
  "nextAttemptAt" timestamptz NOT NULL DEFAULT now(), "lastError" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "sentAt" timestamptz
);
CREATE INDEX IF NOT EXISTS football_deliveries_due ON football_deliveries(status, "nextAttemptAt");
CREATE TABLE IF NOT EXISTS football_jobs (
  name text PRIMARY KEY, "lastStartedAt" timestamptz, "lastSuccessAt" timestamptz,
  "lastError" text, result jsonb
);
-- These tables are backend-only. Supabase API roles must not see device credentials.
ALTER TABLE football_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE football_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE football_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE football_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE football_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE football_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE football_jobs ENABLE ROW LEVEL SECURITY;
