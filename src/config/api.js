const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const envApiUrl = trimTrailingSlash(import.meta.env.VITE_API_URL || "");
const envApiRoot = trimTrailingSlash(import.meta.env.VITE_API_ROOT || "");

export const API_ROOT = envApiRoot || envApiUrl.replace(/\/api$/, "");
export const API_BASE_URL = envApiUrl || (API_ROOT ? `${API_ROOT}/api` : "/api");

export const getServerAssetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const normalizedPath = path.replace(/^\/+/, "");
  return API_ROOT ? `${API_ROOT}/${normalizedPath}` : `/${normalizedPath}`;
};
