/** Public read cache shared by requests handled by this API process. */
export class FootballReadCache {
  private readonly entries = new Map<
    string,
    { value: unknown; expiresAt: number }
  >();
  private readonly pending = new Map<string, Promise<unknown>>();
  private generation = 0;

  constructor(private readonly maxEntries = 256) {}

  async get<T>(
    key: string,
    ttlMs: number | ((value: T) => number),
    load: () => Promise<T>,
  ): Promise<T> {
    const entry = this.entries.get(key);
    if (entry && entry.expiresAt > Date.now()) return entry.value as T;
    const inFlight = this.pending.get(key);
    if (inFlight) return inFlight as Promise<T>;

    const generation = this.generation;
    const request = load();
    this.pending.set(key, request);
    try {
      const value = await request;
      if (this.generation === generation) {
        const lifetime = typeof ttlMs === 'function' ? ttlMs(value) : ttlMs;
        if (lifetime > 0) {
          this.entries.delete(key);
          this.entries.set(key, { value, expiresAt: Date.now() + lifetime });
          if (this.entries.size > this.maxEntries) {
            const oldest = this.entries.keys().next();
            if (!oldest.done) this.entries.delete(oldest.value);
          }
        }
      }
      return value;
    } finally {
      if (this.pending.get(key) === request) this.pending.delete(key);
    }
  }

  clear() {
    this.generation++;
    this.entries.clear();
    this.pending.clear();
  }
}

function seconds(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 && value <= 86_400
    ? value * 1000
    : fallback * 1000;
}

export const matchCacheTtl = {
  live: seconds('MATCH_CACHE_LIVE_SECONDS', 30),
  upcoming: seconds('MATCH_CACHE_UPCOMING_SECONDS', 300),
  finished: seconds('MATCH_CACHE_FINISHED_SECONDS', 1800),
  metadata: seconds('MATCH_CACHE_METADATA_SECONDS', 3600),
  snapshot: seconds('MATCH_CACHE_SNAPSHOT_SECONDS', 900),
};
