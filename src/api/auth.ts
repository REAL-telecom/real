import { API_BASE_URL } from '@config/api';
import { type User } from '@contexts';
import { syncServerTime } from '@utils';

type AuthApiBaseResponse = {
  success: boolean;
  message: string;
  attempt?: number;
  blockExpiresAt?: number;
  nextRequestAvailableAt?: number;
};

type RequestAuthCodeResponse = AuthApiBaseResponse & {
  pinExpiresAt?: number;
};

type VerifyAuthCodeResponse = AuthApiBaseResponse & {
  user?: User;
};

async function request<T extends AuthApiBaseResponse>(
  path: string,
  body: object
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const requestTime = Date.now();

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const responseTime = Date.now();
  const httpDate = response.headers.get('Date');

  syncServerTime(httpDate, requestTime, responseTime);

  const text = await response.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Invalid JSON response for ${path}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid response shape for ${path}`);
  }

  const durationMs = responseTime - requestTime;
  console.log('[auth-api]', {
    durationMs,
    path,
    status: response.status,
    body: parsed,
  });

  return parsed as T;
}

export async function requestAuthCode(phone: string): Promise<RequestAuthCodeResponse> {
  return request<RequestAuthCodeResponse>('/auth/request-code', { phone });
}

export async function verifyAuthCode(
  phone: string,
  code: string
): Promise<VerifyAuthCodeResponse> {
  return request<VerifyAuthCodeResponse>('/auth/verify-code', { phone, code });
}
