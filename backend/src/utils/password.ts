import bcrypt from "bcryptjs";

export const hashPassword = (plainPassword: string) => bcrypt.hash(plainPassword, 12);

export const verifyPassword = (plainPassword: string, passwordHash: string) =>
  bcrypt.compare(plainPassword, passwordHash);