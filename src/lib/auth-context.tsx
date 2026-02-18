"use client";

import { createContext, useContext, type ReactNode } from "react";

// ── Mock user profile ──────────────────────────────────────────────────────────
// Represents a Brisbane-based university student.
// Replace with real auth (NextAuth / Clerk) when adding authentication.

export interface MockUser {
  id: string;
  name: string;
  email: string;
  timezone: string;
  university: string;
  avatar: string;
}

const MOCK_USER: MockUser = {
  id: "mock-user-1",
  name: "Alex Brisbane",
  email: "alex@student.qut.edu.au",
  timezone: "Australia/Brisbane",
  university: "Queensland University of Technology",
  avatar: "AB",
};

// ── Context ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: MockUser;
  isAuthenticated: true;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: MOCK_USER, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
