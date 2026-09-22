import { getSet, listSets, parseListQuery } from "./sets";
import type { ApiError, Env } from "./types";

export function jsonError(status: number, code: string, message: string): Response {
  const body: ApiError = { error: { code, message } };
  return Response.json(body, { status });
}

async function hashApiKey(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function isAuthorized(request: Request, env: Env): Promise<{ authorized: boolean; keyPrefix: string }> {
  const key = request.headers.get("X-API-Key");
  if (!key) return { authorized: false, keyPrefix: "missing" };

  const hash = await hashApiKey(key);
  return { authorized: hash === env.WORKSHOP_API_KEY_SHA256, keyPrefix: hash.slice(0, 8) };
}

function logRequest(path: string, status: number, keyPrefix: string): void {
  console.log(`path=${path} status=${status} key_hash_prefix=${keyPrefix}`);
}

const worker: ExportedHandler<Env> = {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response: Response;
    let keyPrefix = "not_required";

    try {
      if (request.method !== "GET") {
        response = jsonError(404, "not_found", "Not found");
      } else if (url.pathname === "/health") {
        response = Response.json({ ok: true });
      } else if (url.pathname === "/sets" || url.pathname.startsWith("/sets/")) {
        const authorization = await isAuthorized(request, env);
        keyPrefix = authorization.keyPrefix;
        if (!authorization.authorized) {
          response = jsonError(401, "unauthorized", "Unauthorized");
        } else if (url.pathname === "/sets") {
          try {
            response = Response.json(await listSets(env.DB, parseListQuery(url)));
          } catch (error) {
            response = error instanceof RangeError
              ? jsonError(400, "invalid_query", error.message)
              : jsonError(500, "internal_error", "Internal server error");
          }
        } else {
          const set = await getSet(env.DB, decodeURIComponent(url.pathname.slice("/sets/".length)));
          response = set
            ? Response.json(set)
            : jsonError(404, "not_found", "Set not found");
        }
      } else {
        response = jsonError(404, "not_found", "Not found");
      }
    } catch {
      response = jsonError(500, "internal_error", "Internal server error");
    }

    logRequest(url.pathname, response.status, keyPrefix);
    return response;
  },
};

export default worker;
