import { api } from "./api";

export type UserRole = "ADMIN" | "ARTIST" | "CLIENT";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profilePhoto?: string;
}

export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: AuthUser }> {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return { token: data.access_token, user: data.user };
}

export async function register(
  email: string,
  password: string,
  name: string,
  role: "ARTIST" | "CLIENT" = "ARTIST",
  phone?: string
): Promise<{ token: string; user: AuthUser }> {
  const { data } = await api.post("/auth/register", {
    email,
    password,
    name,
    role,
    phone,
  });
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return { token: data.access_token, user: data.user };
}

export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export function getHomeRouteForRole(role: UserRole): string {
  if (role === "CLIENT") return "/meus-agendamentos";
  return "/dashboard";
}
