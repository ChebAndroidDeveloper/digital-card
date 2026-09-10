jest.mock('@nestjs/common', () => ({
  Injectable: () => (target: unknown) => target,
}));

import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProfileService cache', () => {
  const findUnique = jest.fn();
  let service: ProfileService;

  beforeEach(() => {
    jest.useFakeTimers();
    findUnique.mockReset().mockResolvedValue({ id: 'p1', name: 'Test' });
    service = new ProfileService({
      profile: { findUnique },
    } as unknown as PrismaService);
  });

  afterEach(() => jest.useRealTimers());

  it('refreshes the value after TTL', async () => {
    await service.findByLocale('en');
    await jest.advanceTimersByTimeAsync(59_999);
    await service.findByLocale('en');
    expect(findUnique).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1);
    await service.findByLocale('en');
    expect(findUnique).toHaveBeenCalledTimes(2);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('shares a timeout between callers and retries afterwards', async () => {
    findUnique.mockImplementationOnce(() => new Promise(() => {}));
    const first = expect(service.findByLocale('en')).rejects.toThrow(
      'timed out',
    );
    const second = expect(service.findByLocale('en')).rejects.toThrow(
      'timed out',
    );
    await jest.advanceTimersByTimeAsync(8000);
    await Promise.all([first, second]);
    expect(findUnique).toHaveBeenCalledTimes(1);
    expect(await service.findByLocale('en')).toEqual({
      id: 'p1',
      name: 'Test',
    });
    expect(findUnique).toHaveBeenCalledTimes(2);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('clears the timer after an early database error', async () => {
    findUnique.mockRejectedValueOnce(new Error('connection lost'));
    await expect(service.findByLocale('en')).rejects.toThrow('connection lost');
    expect(jest.getTimerCount()).toBe(0);
    await service.findByLocale('en');
    expect(findUnique).toHaveBeenCalledTimes(2);
  });
});
