export type Phone = {
  number: string;
  pinExpiresAt: number | null;
  resendTimeoutExpiresAt: number | null;
};

export type AuthFlowSnapshot = {
  isIPBlocked: boolean;
  clientRateLimitExpiresAt: number | null;
  storedPhoneNumber: string | null;
  phones: Phone[];
  serverTimeOffset: number;
};

export type StoredAuthFlowSnapshot = AuthFlowSnapshot | null;