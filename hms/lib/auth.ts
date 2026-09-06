import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { User, IUser } from "./models/User";
import { connectDB } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "hms_secret_jwt_token_auth_key_2026_999xyz";

export interface TokenPayload {
  userId: string;
  name: string;
  email: string;
  role: "ADMIN" | "STUDENT" | "VIEWER";
  rollNumber?: string;
  roomNumber?: string;
  hostelName?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Multi-identifier user search:
 * Matches Roll Number (case-insensitive), Email (case-insensitive), or Phone Number.
 */
export async function findUserByIdentifier(identifier: string): Promise<IUser | null> {
  await connectDB();
  const clean = identifier.trim();

  // Try exact match by uppercase roll number
  const rollMatch = await User.findOne({ rollNumber: clean.toUpperCase() });
  if (rollMatch) return rollMatch;

  // Try match by email
  const emailMatch = await User.findOne({ email: clean.toLowerCase() });
  if (emailMatch) return emailMatch;

  // Try match by phone
  const phoneMatch = await User.findOne({ phone: clean });
  if (phoneMatch) return phoneMatch;

  return null;
}

/**
 * Extract auth user from NextRequest (Cookie or Authorization Bearer header)
 */
export async function getAuthUser(req: NextRequest): Promise<TokenPayload | null> {
  let token = req.cookies.get("hms_token")?.value;

  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;
  return verifyToken(token);
}
