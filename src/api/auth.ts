import { API_BASE_URL } from '@config/api';
import type { User } from '../contexts/user/types';

type AuthApiBaseResponse = {
  success: boolean;
  message: string;
  attempt?: number;
  blockExpiresAt?: number;
  nextRequestAvailableAt?: number;
};

type VerifyAuthSuccessResponse = AuthApiBaseResponse & {
  user?: User;
};

async function request<T extends AuthApiBaseResponse>(
  path: string,
  body: object
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Invalid JSON response for ${path}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid response shape for ${path}`);
  }

  return parsed as T;
}

export async function requestAuthCode(phone: string): Promise<AuthApiBaseResponse> {
  return request<AuthApiBaseResponse>('/auth/request-code', { phone });
}

export async function verifyAuthCode(
  phone: string,
  code: string
): Promise<VerifyAuthSuccessResponse> {
  return request<VerifyAuthSuccessResponse>('/auth/verify-code', { phone, code });
}
