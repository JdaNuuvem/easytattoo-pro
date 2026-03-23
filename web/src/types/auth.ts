export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  instagram?: string;
  bio?: string;
  pixKey?: string;
  pixName?: string;
  pixBank?: string;
  fixedDeposit: number;
  profilePhoto?: string;
  coverPhoto?: string;
  acceptsCompanion: boolean;
  maxDailyHours: number;
  createdAt: string;
}

export interface Studio {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  userId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
