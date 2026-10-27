/** Small fetch-based API client — the session lives in an httpOnly cookie. */
export class ApiRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Older builds stored the JWT in localStorage, where any XSS could read it.
// The session is an httpOnly cookie now, so clear any legacy copies once.
try {
  if (typeof window !== "undefined") window.localStorage.removeItem("rc_token");
} catch {
  // Storage unavailable (private mode / disabled) — nothing to clean up.
}

type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...rest,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(headers as Record<string, string>),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiRequestError(0, "Network error. Please check your connection.");
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = (data as { message?: string } | null)?.message ?? `Request failed (${res.status})`;
    throw new ApiRequestError(res.status, message);
  }
  return data as T;
}
