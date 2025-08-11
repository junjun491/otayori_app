export async function apiClient(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
