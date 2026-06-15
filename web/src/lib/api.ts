export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function req<T>(method: string, url: string, body?: unknown): Promise<T> {
  const opts: RequestInit = { method, credentials: 'include' };
  if (body !== undefined) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  }
  const r = await fetch(url, opts);
  if (!r.ok) {
    let msg = `http_${r.status}`;
    try {
      const j = await r.json();
      msg = j.message || j.error || msg;
    } catch {
      /* ignore */
    }
    throw new ApiError(r.status, msg);
  }
  const ct = r.headers.get('content-type') || '';
  return (ct.includes('application/json') ? r.json() : r.text()) as Promise<T>;
}

export const api = {
  get: <T>(url: string) => req<T>('GET', url),
  post: <T>(url: string, body?: unknown) => req<T>('POST', url, body),
  put: <T>(url: string, body?: unknown) => req<T>('PUT', url, body),
};
