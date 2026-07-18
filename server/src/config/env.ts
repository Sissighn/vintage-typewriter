import dotenv from "dotenv";

dotenv.config();

const REQUIRED_ENV_VARS = [
  "JWT_SECRET",
  "PASSWORD_PEPPER",
  "GOOGLE_CLIENT_ID",
] as const;

function requireEnv(name: (typeof REQUIRED_ENV_VARS)[number]): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function validateSecret(name: string, value: string): void {
  if (value === "default_pepper") {
    throw new Error(`${name} must not use the insecure default_pepper value.`);
  }

  if (value.length < 32) {
    throw new Error(`${name} must be at least 32 characters long.`);
  }
}

const jwtSecret = requireEnv("JWT_SECRET");
const passwordPepper = requireEnv("PASSWORD_PEPPER");
const googleClientId = requireEnv("GOOGLE_CLIENT_ID");

validateSecret("JWT_SECRET", jwtSecret);
validateSecret("PASSWORD_PEPPER", passwordPepper);

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5001,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret,
  passwordPepper,
  googleClientId,
};

export const isProduction = env.nodeEnv === "production";
