export const API_URL = "http://192.168.1.2:3000";

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  let data: any = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}
