import { COOKIE_NAME } from "@/lib/auth";
import { NextResponse } from "next/server";
import { nextRespondWithError } from "@/lib/api-errors";

export async function POST() {
  try {
    const res = NextResponse.json({
      ok: true,
      message: "You have been signed out successfully.",
    });
    res.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (err) {
    return nextRespondWithError(
      err,
      "auth/logout",
      "Sign-out failed due to a server error."
    );
  }
}
