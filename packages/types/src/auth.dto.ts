export type UserRole = 'ADMIN' | 'EDITOR' | 'OFFICER' | 'CITIZEN';

export interface UserDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginRequestDto {
  username: string;
  password?: string;
  ssoToken?: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserDto;
}

export interface JwtPayloadDto {
  sub: string; // User ID
  username: string;
  role: UserRole;
  email: string;
  iat?: number;
  exp?: number;
}
