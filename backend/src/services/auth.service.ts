import { authRepository } from "../repositories/auth.repository";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../utils/jwt";

function badRequest(message: string) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = 400;
  return error;
}

function unauthorized(message: string) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = 401;
  return error;
}

export const authService = {
  async register(payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const existing = await authRepository.findUserByEmail(payload.email);
    if (existing) {
      throw badRequest("El email ya esta registrado");
    }

    const passwordHash = await hashPassword(payload.password);

    const user = await authRepository.createUser({
      email: payload.email,
      passwordHash,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone
    });

    const role = await authRepository.findRoleByCode("CLIENTE");
    if (!role) {
      throw badRequest("No existe el rol CLIENTE");
    }

    await authRepository.assignRole(user.id, role.id);
    await authRepository.createCartForUser(user.id);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
  },

  async login(payload: { email: string; password: string }) {
    const user = await authRepository.findUserByEmail(payload.email);
    if (!user) {
      throw unauthorized("Credenciales invalidas");
    }

    const isValidPassword = await verifyPassword(payload.password, user.passwordHash);
    if (!isValidPassword) {
      throw unauthorized("Credenciales invalidas");
    }

    const roles = user.roles.map((userRole) => userRole.role.code);

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      roles
    });

    const refreshToken = signRefreshToken({ sub: user.id });
    const refreshDecoded = verifyRefreshToken(refreshToken);

    await authRepository.createRefreshToken(
      hashToken(refreshToken),
      user.id,
      new Date(refreshDecoded.exp * 1000)
    );

    await authRepository.createCartForUser(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles
      }
    };
  },

  async refresh(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const stored = await authRepository.findRefreshToken(tokenHash);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.userId !== decoded.sub) {
      throw unauthorized("Refresh token invalido");
    }

    await authRepository.revokeRefreshToken(tokenHash);

    const user = await authRepository.findUserById(decoded.sub);
    if (!user) {
      throw unauthorized("Usuario no encontrado");
    }

    const roles = user.roles.map((userRole) => userRole.role.code);
    const newAccessToken = signAccessToken({ sub: user.id, email: user.email, roles });
    const newRefreshToken = signRefreshToken({ sub: user.id });
    const newRefreshDecoded = verifyRefreshToken(newRefreshToken);

    await authRepository.createRefreshToken(
      hashToken(newRefreshToken),
      user.id,
      new Date(newRefreshDecoded.exp * 1000)
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  },

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const stored = await authRepository.findRefreshToken(tokenHash);
    if (!stored || stored.revokedAt) {
      return;
    }

    await authRepository.revokeRefreshToken(tokenHash);
  },

  async getMe(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw unauthorized("Usuario no encontrado");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      roles: user.roles.map((userRole) => userRole.role.code)
    };
  }
};