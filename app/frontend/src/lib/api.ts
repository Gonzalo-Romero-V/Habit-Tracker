const TOKEN_STORAGE_KEY = "habit_tracker_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

type ApiErrorBody = {
  error: {
    code: string;
    mensaje: string;
    fields?: Record<string, string[]>;
  };
};

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string[]>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error.mensaje);
    this.status = status;
    this.code = body.error.code;
    this.fields = body.error.fields;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("X-Client-Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);

  const response = await fetch(`/api/v1${path}`, { ...options, headers });
  const body = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, body as ApiErrorBody);
  }

  return (body as { data: T }).data;
}
