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

/** Build web: relativo, resuelto por el rewrite server-side de
 * next.config.ts hacia BACKEND_URL. Build mobile (export estático de
 * Capacitor, sin servidor Next.js corriendo): absoluto, embebido a
 * propósito desde NEXT_PUBLIC_API_URL — ver decisions/environments.md.
 * El switch mira NEXT_PUBLIC_BUILD_TARGET (no BUILD_TARGET a secas, que
 * al no llevar el prefijo NEXT_PUBLIC_ se recorta del bundle del
 * browser) para no depender de si NEXT_PUBLIC_API_URL "está seteado" —
 * en dev ambas variables conviven en el mismo .env aunque el build sea web. */
const API_BASE =
  process.env.NEXT_PUBLIC_BUILD_TARGET === "mobile" ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1` : "/api/v1";

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("X-Client-Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const body = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, body as ApiErrorBody);
  }

  return (body as { data: T }).data;
}
