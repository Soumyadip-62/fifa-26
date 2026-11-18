-- Run only AFTER deploying and verifying the protected HTTP endpoints.
-- Configure Vault names football_api_url and football_scheduler_secret first.
-- football_api_url: confirmed HTTPS backend URL, no trailing slash.
-- football_scheduler_secret: same random value as backend FOOTBALL_SCHEDULER_SECRET.
-- Use Dashboard Vault to avoid putting credentials into SQL history.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.football_invoke_job(job text)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE api_url text; credential text;
BEGIN
  IF job NOT IN ('scores','schedules','reminders') THEN RAISE EXCEPTION 'Unknown football job'; END IF;
  SELECT decrypted_secret INTO api_url FROM vault.decrypted_secrets WHERE name='football_api_url';
  SELECT decrypted_secret INTO credential FROM vault.decrypted_secrets WHERE name='football_scheduler_secret';
  IF api_url IS NULL OR credential IS NULL OR api_url NOT LIKE 'https://%' THEN
    RAISE EXCEPTION 'Football scheduler Vault configuration is missing';
  END IF;
  RETURN net.http_post(
    url := rtrim(api_url, '/') || '/football/jobs/' || job,
    headers := jsonb_build_object('Content-Type','application/json','x-scheduler-secret',credential),
    body := '{}'::jsonb,
    timeout_milliseconds := 180000
  );
END $$;
REVOKE ALL ON FUNCTION public.football_invoke_job(text) FROM PUBLIC, anon, authenticated;

-- These are lightweight wake-up triggers. The API checks persisted fixtures and
-- last success read-only, then skips without job or fixture writes until due.
-- Scores may be woken every 5 minutes for live-play responsiveness; actual
-- provider refreshes are hourly on matchdays and wait for the next kickoff
-- when no fixture is scheduled today. Schedule imports run hourly on matchdays
-- and at most every 2 hours otherwise.
-- Idempotent names: pg_cron updates named jobs on repeated installation.
SELECT cron.schedule('football-scores', '*/5 * * * *', $$SELECT public.football_invoke_job('scores')$$);
SELECT cron.schedule('football-schedules', '5 * * * *', $$SELECT public.football_invoke_job('schedules')$$);
SELECT cron.schedule('football-reminders', '* * * * *', $$SELECT public.football_invoke_job('reminders')$$);
-- Install in a disabled state. Enable after endpoint checks and a device push test.
UPDATE cron.job SET active=false WHERE jobname IN ('football-scores','football-schedules','football-reminders');
-- Activation, after checks:
-- UPDATE cron.job SET active=true WHERE jobname IN ('football-scores','football-schedules');
-- After Firebase is configured and FOOTBALL_PUSH_ENABLED=true, enable reminders separately:
-- UPDATE cron.job SET active=true WHERE jobname='football-reminders';
-- HTTP transport failures: SELECT id,status_code,error_msg,created FROM net._http_response ORDER BY created DESC LIMIT 20;
-- Job outcomes: SELECT * FROM football_jobs ORDER BY name;
