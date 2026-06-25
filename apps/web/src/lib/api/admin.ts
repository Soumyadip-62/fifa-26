import { apiUrl } from "./config";

async function postAdminAction(path: string) {
  const response = await fetch(apiUrl(path), {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Admin action failed: ${path}`);
  }

  return response.json();
}

export function syncMatchesDb() {
  return postAdminAction("matches/sync");
}

export function syncQualifiedTeamsDb() {
  return postAdminAction("points-table/qualified-teams/sync");
}
