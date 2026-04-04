import bcrypt from "bcryptjs";
import { sqlGet, sqlRun, newId } from "@/lib/sqlite";
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

    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!fullName) {
      return NextResponse.json(
        {
          error: "Full name is required.",
          code: "FULL_NAME_REQUIRED",
        },
        { status: 400 }
      );
    }
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

    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "Password must be at least 6 characters long.",
          code: "PASSWORD_TOO_SHORT",
        },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
          code: "EMAIL_INVALID",
        },
        { status: 400 }
      );
    }

    const existing = await sqlGet(
      "SELECT id FROM users WHERE email = ?",
      email
    );
    if (existing) {
      return NextResponse.json(
        {
          error: "An account with this email already exists. Try logging in instead.",
          code: "EMAIL_ALREADY_EXISTS",
        },
        { status: 409 }
      );
    }

    let hashed;
    try {
      hashed = await bcrypt.hash(password, 10);
    } catch (hashErr) {
      console.error("[auth/register] bcrypt", hashErr);
      return NextResponse.json(
        {
          error: "Could not process your password. Please try a different password.",
          code: "PASSWORD_HASH_FAILED",
        },
        { status: 500 }
      );
    }

    let user;
    try {
      const id = newId();
      await sqlRun(
        "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
        id,
        fullName,
        email,
        hashed
      );
      user = await sqlGet(
        "SELECT id, name, email FROM users WHERE id = ?",
        id
      );
    } catch (createErr) {
      return nextRespondWithError(
        createErr,
        "auth/register create user",
        "Registration could not be completed. Please try again."
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
        "auth/register signToken",
        "Account was created but sign-in failed. Please log in manually."
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
      "auth/register",
      "Registration failed due to a server error."
    );
  }
}
