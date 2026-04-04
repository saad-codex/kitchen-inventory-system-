import { NextResponse } from "next/server";

/** Standard message when auth cookie is missing or invalid */
export const MSG_UNAUTHORIZED =
  "You are not signed in or your session has expired. Please log in again.";

export const CODE_UNAUTHORIZED = "UNAUTHORIZED";

/**
 * Parse request body as JSON object. Returns a result object — never throws.
 * @param {Request} request
 * @returns {Promise<{ ok: true, body: Record<string, unknown> } | { ok: false, response: Response }>}
 */
export async function parseJsonObject(request) {
  try {
    const raw = await request.text();
    if (raw === undefined || raw === null || String(raw).trim() === "") {
      return {
        ok: false,
        response: jsonError(
          "Request body is empty. Send a JSON object with Content-Type: application/json.",
          400,
          "EMPTY_BODY"
        ),
      };
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        ok: false,
        response: jsonError(
          "Invalid JSON: the body could not be parsed. Check commas, quotes, and brackets.",
          400,
          "INVALID_JSON"
        ),
      };
    }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        ok: false,
        response: jsonError(
          "Request body must be a JSON object (not an array or primitive).",
          400,
          "INVALID_BODY_SHAPE"
        ),
      };
    }
    return { ok: true, body: /** @type {Record<string, unknown>} */ (parsed) };
  } catch {
    return {
      ok: false,
      response: jsonError(
        "Could not read the request body.",
        400,
        "BODY_READ_FAILED"
      ),
    };
  }
}

/**
 * @param {string} error
 * @param {number} [status]
 * @param {string} [code]
 */
export function jsonError(error, status = 400, code) {
  const payload = { error };
  if (code) payload.code = code;
  return Response.json(payload, { status });
}

/**
 * @param {string} error
 * @param {number} [status]
 * @param {string} [code]
 */
export function nextJsonError(error, status = 400, code) {
  const payload = { error };
  if (code) payload.code = code;
  return NextResponse.json(payload, { status });
}

/**
 * Map known errors to HTTP responses. Returns null if unrecognized (log + generic 500).
 * @param {unknown} err
 * @returns {{ status: number, error: string, code: string } | null}
 */
export function resolveApiError(err) {
  if (!err || typeof err !== "object") {
    return {
      status: 500,
      error: "An unexpected error occurred.",
      code: "UNKNOWN_ERROR",
    };
  }

  const e = /** @type {Error & { code?: number | string; keyPattern?: Record<string, number>; errors?: Record<string, { message?: string }>; name?: string }} */ (
    err
  );

  if (e.code === "SQLITE_CONSTRAINT" && typeof e.message === "string") {
    if (e.message.includes("users.email")) {
      return {
        status: 409,
        error: "An account with this email already exists.",
        code: "EMAIL_ALREADY_EXISTS",
      };
    }
    return {
      status: 409,
      error: "This operation conflicts with existing data.",
      code: "SQLITE_CONSTRAINT",
    };
  }

  if (typeof e.code === "string" && e.code.startsWith("SQLITE_")) {
    return {
      status: 503,
      error:
        "Could not use the local database. Check that the app can write to the data folder, or set SQLITE_DB_PATH to a writable file path.",
      code: "DB_SQLITE_ERROR",
    };
  }

  if (e.code === "DB_CONNECT") {
    return {
      status: 503,
      error: "Could not open the database file.",
      code: "DB_CONNECTION_FAILED",
    };
  }

  if (e.message === "JWT_SECRET is not set") {
    return {
      status: 500,
      error:
        "Server configuration error: JWT_SECRET is not set. Add it to your environment.",
      code: "JWT_CONFIG_MISSING",
    };
  }

  if (e.code === "JWT_SIGN_FAILED") {
    return {
      status: 500,
      error: "Could not create a session token. Please try again.",
      code: "JWT_SIGN_FAILED",
    };
  }

  if (e.code === 11000 && e.keyPattern) {
    const field = Object.keys(e.keyPattern)[0] || "field";
    if (field === "email") {
      return {
        status: 409,
        error: "An account with this email already exists.",
        code: "EMAIL_ALREADY_EXISTS",
      };
    }
    return {
      status: 409,
      error: `A record with this ${field} already exists.`,
      code: "DUPLICATE_KEY",
    };
  }

  if (e.name === "ValidationError" && e.errors) {
    const first = Object.values(e.errors)[0];
    const msg =
      first && typeof first === "object" && "message" in first
        ? String(first.message)
        : "One or more fields failed validation.";
    return {
      status: 400,
      error: msg,
      code: "VALIDATION_ERROR",
    };
  }

  if (e.name === "CastError") {
    return {
      status: 400,
      error: "Invalid ID format for this resource.",
      code: "INVALID_OBJECT_ID",
    };
  }

  return null;
}

/**
 * @param {unknown} err
 * @param {string} logTag
 * @param {string} [fallbackMessage]
 */
export function respondWithError(err, logTag, fallbackMessage) {
  const resolved = resolveApiError(err);
  if (resolved) {
    return jsonError(resolved.error, resolved.status, resolved.code);
  }
  console.error(`[API ${logTag}]`, err);
  return jsonError(
    fallbackMessage ||
      "An unexpected server error occurred. Please try again later.",
    500,
    "INTERNAL_ERROR"
  );
}

/**
 * @param {unknown} err
 * @param {string} logTag
 * @param {string} [fallbackMessage]
 */
export function nextRespondWithError(err, logTag, fallbackMessage) {
  const resolved = resolveApiError(err);
  if (resolved) {
    return nextJsonError(resolved.error, resolved.status, resolved.code);
  }
  console.error(`[API ${logTag}]`, err);
  return nextJsonError(
    fallbackMessage ||
      "An unexpected server error occurred. Please try again later.",
    500,
    "INTERNAL_ERROR"
  );
}
