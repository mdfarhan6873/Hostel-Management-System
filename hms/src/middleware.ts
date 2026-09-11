import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_key_459d51148495";
const AUTH_COOKIE_NAME = "hms_token";

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

async function verifyJwtToken(token: string, secret: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode and parse payload
    const payloadStr = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadStr);

    // Verify token expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    // Verify cryptographic HMAC-SHA256 signature using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const binarySig = Uint8Array.from(base64UrlDecode(signatureB64), (c) => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, binarySig, data);

    if (!isValid) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const session = token ? await verifyJwtToken(token, JWT_SECRET) : null;
  const isAuthenticated = !!session;
  const role = session?.role;

  // Helper to construct absolute redirect URLs
  const createRedirect = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    return NextResponse.redirect(url);
  };

  // 1. LANDING PAGE & /login
  // If user is already logged in, redirect them immediately to their dashboard
  if (pathname === "/" || pathname === "/login") {
    if (isAuthenticated && role) {
      if (role === "superadmin") {
        return createRedirect("/superadmin");
      }
      if (role === "warden") {
        return createRedirect("/warden");
      }
      if (role === "student") {
        return createRedirect("/student");
      }
    }
    // If not authenticated, allow viewing landing page
    if (pathname === "/login") {
      return createRedirect("/");
    }
    return NextResponse.next();
  }

  // 2. PROTECTED ROUTE: /superadmin/*
  if (pathname.startsWith("/superadmin")) {
    if (!isAuthenticated) {
      return createRedirect("/");
    }
    if (role !== "superadmin") {
      // Redirect to user's permitted dashboard
      return createRedirect(role === "warden" ? "/warden" : "/student");
    }
    return NextResponse.next();
  }

  // 3. PROTECTED ROUTE: /warden/*
  if (pathname.startsWith("/warden")) {
    if (!isAuthenticated) {
      return createRedirect("/");
    }
    if (role !== "warden" && role !== "superadmin") {
      return createRedirect("/student");
    }
    return NextResponse.next();
  }

  // 4. PROTECTED ROUTE: /student/*
  if (pathname.startsWith("/student")) {
    if (!isAuthenticated) {
      return createRedirect("/");
    }
    if (role !== "student") {
      return createRedirect(role === "superadmin" ? "/superadmin" : "/warden");
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (*.png, *.jpg, *.jpeg, *.gif, *.svg, *.webp, *.pdf)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|pdf)$).*)",
  ],
};
