export async function withTimeout<T>(
  operation: PromiseLike<T>,
  timeoutMs: number,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('Database request timed out')),
          timeoutMs,
        );
        timer.unref();
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
