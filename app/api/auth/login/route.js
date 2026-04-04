import bcrypt from "bcryptjs";
import { sqlGet } from "@/lib/sqlite";
import { COOKIE_NAME, signToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  parseJsonObject,
  nextRespondWithError,
} from "@/lib/api-errors";

export async function POST(request) {
  try {
    const parsed = await parseJsonObject(request);
    if (!parsed.ok) {
      return parsed.response;
    }
    const body = parsed.body;

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!email) {
      return NextResponse.json(
        {
          error: "Email address is required.",
          code: "EMAIL_REQUIRED",
        },
        { status: 400 }
      );
    }
    if (!password) {
      return NextResponse.json(
        {
          error: "Password is required.",
          code: "PASSWORD_REQUIRED",
        },
        { status: 400 }
      );
    }

    const user = await sqlGet(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      email
    );
    if (!user) {
      return NextResponse.json(
        {
          error: "No account found for this email, or the password is incorrect.",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    let ok = false;
    try {
      ok = await bcrypt.compare(password, user.password);
    } catch (compareErr) {
      console.error("[auth/login] bcrypt.compare", compareErr);
      return NextResponse.json(
        {
          error: "Could not verify your password. Please try again.",
          code: "PASSWORD_VERIFY_FAILED",
        },
        { status: 500 }
      );
    }

    if (!ok) {
      return NextResponse.json(
        {
          error: "No account found for this email, or the password is incorrect.",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    let token;
    try {
      token = signToken({
        userId: String(user.id),
        email: user.email,
      });
    } catch (tokenErr) {
      return nextRespondWithError(
        tokenErr,
        "auth/login signToken",
        "Login failed while creating your session. Please try again."
      );
    }

    const res = NextResponse.json({
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
      },
    });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (err) {
    return nextRespondWithError(
      err,
      "auth/login",
      "Login failed due to a server error."
    );
  }
}
