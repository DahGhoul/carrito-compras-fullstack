import { prisma } from "../lib/prisma";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
  },

  createUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    return prisma.user.create({
      data: {
        ...data,
        emailVerified: false
      }
    });
  },

  findRoleByCode(code: string) {
    return prisma.role.findUnique({ where: { code } });
  },

  assignRole(userId: string, roleId: string) {
    return prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      },
      update: {},
      create: {
        userId,
        roleId
      }
    });
  },

  createCartForUser(userId: string) {
    return prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId }
    });
  },

  createRefreshToken(tokenHash: string, userId: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt
      }
    });
  },

  findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });
  },

  revokeRefreshToken(tokenHash: string) {
    return prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() }
    });
  }
};