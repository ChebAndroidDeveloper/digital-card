export function runtimeDatabaseUrl(value: string): string {
  const url = new URL(value);
  url.searchParams.set('connect_timeout', '2');
  url.searchParams.set('pool_timeout', '2');
  url.searchParams.set('socket_timeout', '5');
  const options = url.searchParams.get('options') ?? '';
  url.searchParams.set(
    'options',
    `${options} -c statement_timeout=4000 -c lock_timeout=2000`.trim(),
  );
  return url.toString();
}
