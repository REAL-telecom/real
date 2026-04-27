let serverTimeOffset = 0;

export function syncServerTime(
  httpDateHeader: string | null,
  requestTime: number,
  responseTime: number
): void {
  if (!httpDateHeader) return;

  const serverTime = Date.parse(httpDateHeader);
  if (isNaN(serverTime)) return;

  const rtt = responseTime - requestTime;
  const estimatedServerTime = serverTime + rtt / 2;

  serverTimeOffset = estimatedServerTime - responseTime;
}

export function getServerTimeOffset(): number {
  return serverTimeOffset;
}

export function setServerTimeOffset(offset: number): void {
  if (!Number.isFinite(offset)) return;
  serverTimeOffset = offset;
}
