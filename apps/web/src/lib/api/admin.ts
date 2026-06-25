import { apiUrl } from "./config";

function adminHeaders(adminSecret: string) {
  return adminSecret
    ? {
        "x-admin-secret": adminSecret,
      }
    : undefined;
}

async function postAdminAction(path: string, adminSecret: string) {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    headers: adminHeaders(adminSecret),
  });

  if (!response.ok) {
    throw new Error(`Admin action failed: ${path}`);
  }

  return response.json();
}

export function syncMatchesDb(adminSecret: string) {
  return postAdminAction("matches/sync", adminSecret);
}

export function syncQualifiedTeamsDb(adminSecret: string) {
  return postAdminAction("points-table/qualified-teams/sync", adminSecret);
}
