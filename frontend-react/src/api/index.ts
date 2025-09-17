import type { RunAgentParams, SessionRecord } from './types';

let baseUrl = 'http://localhost:8000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, '');
}

export function setBaseUrl(url: string) {
  baseUrl = normalizeBaseUrl(url);
}

export function getBaseUrl() {
  return baseUrl;
}

async function request<T>(path: string, { method = 'GET', body, headers = {} }: RequestOptions = {}): Promise<T> {
  const url = new URL(path, baseUrl).toString();
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body !== undefined) {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  } else {
    delete (fetchOptions.headers as Record<string, string>)['Content-Type'];
  }

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText || 'Yêu cầu thất bại');
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

export async function listApps() {
  return request<string[]>('/list-apps');
}

export interface SessionParams {
  appName: string;
  userId: string;
  sessionId: string;
  state?: Record<string, unknown>;
}

export async function createOrUpdateSession({ appName, userId, sessionId, state }: SessionParams) {
  if (!appName || !userId || !sessionId) {
    throw new Error('Thiếu tham số khởi tạo session.');
  }
  const path = `/apps/${encodeURIComponent(appName)}/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}`;
  const payload = state ? { state } : {};
  return request<SessionRecord>(path, { method: 'POST', body: payload });
}

export async function getSession({ appName, userId, sessionId }: SessionParams) {
  if (!appName || !userId || !sessionId) {
    throw new Error('Thiếu thông tin session.');
  }
  const path = `/apps/${encodeURIComponent(appName)}/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}`;
  return request<SessionRecord>(path);
}

export async function runAgent(payload: RunAgentParams) {
  return request('/run', { method: 'POST', body: payload });
}
