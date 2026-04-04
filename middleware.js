import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

function clearAuthCookie(response) {
  response.cookies.set("token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function middleware(request) {
  try {
    const token = request.cookies.get("token")?.value?.trim();
    const secret = process.env.JWT_SECRET?.trim();

    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!secret) {
      console.error(
        "[middleware] JWT_SECRET is missing — cannot verify sessions. Redirecting to home."
      );
      return clearAuthCookie(NextResponse.redirect(new URL("/", request.url)));
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
    } catch (verifyErr) {
      const reason =
        verifyErr && typeof verifyErr === "object" && "code" in verifyErr
          ? String(verifyErr.code)
          : verifyErr instanceof Error
            ? verifyErr.message
            : "invalid_token";
      console.warn(
        "[middleware] Session token rejected (expired, tampered, or wrong secret):",
        reason
      );
      return clearAuthCookie(
        NextResponse.redirect(new URL("/", request.url))
      );
    }

    return NextResponse.next();
  } catch (err) {
    console.error("[middleware] Unexpected error while checking auth:", err);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/authorized_user_dashboard/:path*"],
};
