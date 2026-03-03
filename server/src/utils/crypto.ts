// server/src/utils/crypto.ts
import argon2 from "argon2";

const PEPPER = process.env.PASSWORD_PEPPER || "default_pepper";

export const hashPassword = async (password: string): Promise<string> => {
  // Wir fügen den Pepper zum Passwort hinzu, bevor wir hashen
  return await argon2.hash(password + PEPPER);
};

export const verifyPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await argon2.verify(hash, password + PEPPER);
};
