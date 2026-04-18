const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    let detail = data?.detail || data?.message || "Something went wrong.";
    if (Array.isArray(detail)) {
      detail = detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('; ');
    }
    throw new Error(detail);
  }

  return data;
}

export function apiGet(path, token) {
  return request(path, { method: "GET", token });
}

export function apiPost(path, body, token) {
  return request(path, { method: "POST", body, token });
}

export function apiPut(path, body, token) {
  return request(path, { method: "PUT", body, token });
}
