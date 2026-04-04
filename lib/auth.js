import jwt from "jsonwebtoken";

const COOKIE_NAME = "token";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function signToken(payload) {
  try {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
  } catch (err) {
    if (err instanceof Error && err.message === "JWT_SECRET is not set") {
      throw err;
    }
    const wrap = new Error(
      err instanceof Error ? err.message : "Failed to sign session token"
    );
    wrap.code = "JWT_SIGN_FAILED";
    throw wrap;
  }
}

/**
 * @param {import('next/server').NextRequest} request
 */
export function getUserIdFromRequest(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !String(token).trim()) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (
      decoded &&
      typeof decoded === "object" &&
      typeof decoded.userId === "string" &&
      decoded.userId.trim()
    ) {
      return decoded.userId;
    }
    return null;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
