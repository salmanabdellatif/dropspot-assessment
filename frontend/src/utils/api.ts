const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type FetchOptions = RequestInit & {
  token?: string | null;
};

export async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers, ...restOptions } = options;

  // 1. Get token from storage if not explicitly provided
  let authToken = token;
  if (!authToken && typeof window !== "undefined") {
    const stored = localStorage.getItem("auth");
    if (stored) {
      authToken = JSON.parse(stored).token;
    }
  }

  // 2. Prepare headers
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };

  // 3. Make request
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { ...defaultHeaders, ...headers },
    ...restOptions,
  });

  // 4. Handle response
  let data;
  try {
    data = await res.json();
  } catch (err) {
    // If response isn't JSON (e.g., 404 Not Found HTML page), handle gracefully
    if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}, error: ${err}`);
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Something went wrong");
  }

  return data as T;
}
