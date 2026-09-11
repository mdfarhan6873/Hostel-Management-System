import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { Role } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_key_459d51148495";
export const AUTH_COOKIE_NAME = "hms_token";

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
  assignedCategory?: string;
  status?: string; // for students
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

export async function getCurrentSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function verifyAuth(): Promise<{
  userId: string;
  email: string;
  name: string;
  role: Role;
  assignedCategory?: string;
  status?: string;
} | null> {
  const session = await getCurrentSession();
  if (!session) return null;
  return {
    userId: session.id,
    email: session.email,
    name: session.name,
    role: session.role,
    assignedCategory: session.assignedCategory,
    status: session.status,
  };
}

