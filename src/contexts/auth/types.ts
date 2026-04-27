export type Phone = {
  number: string;
  resendTimeoutExpiresAt: number | null;
};

export type AuthFlowSnapshot = {
  storedPhoneNumber: string | null;
  clientRateLimitExpiresAt: number | null;
  phones: Phone[];
  serverTimeOffset: number;
};

export type StoredAuthFlowSnapshot = AuthFlowSnapshot | null;