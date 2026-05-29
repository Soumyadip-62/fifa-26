const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export function apiUrl(path: string) {
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
  }

  const normalizedBaseUrl = backendUrl.endsWith("/")
    ? backendUrl
    : `${backendUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return new URL(normalizedPath, normalizedBaseUrl).toString();
}
