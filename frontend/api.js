import { updateState, getState } from './state.js';

let baseUrl = 'http://localhost:8000';

function normalizeBaseUrl(url) {
  if (!url) return baseUrl;
  return url.replace(/\/$/, '');
}

export function setBaseUrl(url) {
  baseUrl = normalizeBaseUrl(url);
  updateState({ baseUrl });
}

export function getBaseUrl() {
  return baseUrl;
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const url = new URL(path, baseUrl).toString();
  const requestHeaders = { ...headers };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const opts = {
    method,
    headers: requestHeaders,
  };

  if (body !== undefined) {
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText || 'Yêu cầu thất bại');
  }
  if (res.status === 204) {
    return null;
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

export async function pingServer() {
  const data = await request('/list-apps');
  return data;
}

export async function createOrUpdateSession({ appName, userId, sessionId, state }) {
  if (!appName || !userId || !sessionId) {
    throw new Error('Thiếu tham số khởi tạo session.');
  }
  const path = `/apps/${encodeURIComponent(appName)}/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}`;
  const payload = state ? { state } : {};
  const session = await request(path, { method: 'POST', body: payload });
  updateState({ session });
  return session;
}

export async function getSession({ appName, userId, sessionId }) {
  if (!appName || !userId || !sessionId) {
    throw new Error('Thiếu thông tin session.');
  }
  const path = `/apps/${encodeURIComponent(appName)}/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}`;
  const session = await request(path);
  updateState({ session });
  return session;
}

export async function runAgent({ appName, userId, sessionId, message, streaming = false }) {
  if (!appName || !userId || !sessionId) {
    throw new Error('Thiếu thông tin session.');
  }
  const payload = {
    app_name: appName,
    user_id: userId,
    session_id: sessionId,
    new_message: message,
    streaming,
  };
  const events = await request('/run', { method: 'POST', body: payload });
  if (Array.isArray(events)) {
    updateState({ events });
  }
  return events;
}

export function ensureSessionParams() {
  const { session } = getState();
  if (!session) return null;
  const { appName, userId, id: sessionId } = session;
  return { appName, userId, sessionId };
}
