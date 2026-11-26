import { FootballReadCache } from './football-cache';

describe('shared public read cache', () => {
  afterEach(() => jest.useRealTimers());

  it('serves repeated reads until expiry, then reloads', async () => {
    jest.useFakeTimers({ now: 1000 });
    const cache = new FootballReadCache();
    const load = jest
      .fn()
      .mockResolvedValueOnce({ value: 1 })
      .mockResolvedValueOnce({ value: 2 });
    expect(await cache.get('matches:pl:1', 60_000, load)).toEqual({ value: 1 });
    expect(await cache.get('matches:pl:1', 60_000, load)).toEqual({ value: 1 });
    expect(load).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(60_000);
    expect(await cache.get('matches:pl:1', 60_000, load)).toEqual({ value: 2 });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('coalesces concurrent misses and separates keys', async () => {
    const cache = new FootballReadCache();
    let resolve!: (value: number) => void;
    const load = jest.fn(
      () =>
        new Promise<number>((done) => {
          resolve = done;
        }),
    );
    const first = cache.get('pl:1', 1000, load);
    const second = cache.get('pl:1', 1000, load);
    expect(load).toHaveBeenCalledTimes(1);
    resolve(7);
    expect(await Promise.all([first, second])).toEqual([7, 7]);
    expect(await cache.get('pl:2', 1000, () => Promise.resolve(9))).toBe(9);
  });

  it('does not repopulate an invalidated entry from an older request', async () => {
    const cache = new FootballReadCache();
    let resolve!: (value: number) => void;
    const old = cache.get(
      'pl:1',
      1000,
      () =>
        new Promise<number>((done) => {
          resolve = done;
        }),
    );
    cache.clear();
    expect(await cache.get('pl:1', 1000, () => Promise.resolve(2))).toBe(2);
    resolve(1);
    expect(await old).toBe(1);
    expect(await cache.get('pl:1', 1000, () => Promise.resolve(3))).toBe(2);
  });
});
