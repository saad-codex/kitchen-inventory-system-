import { sqlGet } from "@/lib/sqlite";
import { getUserIdFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  nextJsonError,
  resolveApiError,
} from "@/lib/api-errors";

export async function GET(request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ user: null, message: "Not signed in." });
  }

  try {
    const user = await sqlGet(
      "SELECT id, name, email FROM users WHERE id = ?",
      userId
    );
    if (!user) {
      return NextResponse.json({
        user: null,
        message:
          "Your session is no longer valid (user not found). Please sign in again.",
        code: "USER_NOT_FOUND",
      });
    }
    return NextResponse.json({
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    const resolved = resolveApiError(err);
    if (resolved) {
      return nextJsonError(resolved.error, resolved.status, resolved.code);
    }
    console.error("[auth/me]", err);
    return nextJsonError(
      "Could not load your profile. The database may be unavailable.",
      503,
      "PROFILE_LOAD_FAILED"
    );
  }
}
