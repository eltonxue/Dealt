import { sign } from "jsonwebtoken";
import { User } from "../entities";

const randomize = require("randomatic");

const ACCESS_TOKEN_EXPIRATION_LENGTH = 60 * 60; // Expires in 1 hour
const REFRESH_TOKEN_EXPIRATION_LENGTH = 60 * 60 * 24 * 30 * 12; // Expires in 1 year
const RESET_TOKEN_EXPIRATION_LENGTH = 60 * 10; // Expires in 10 minutes

export const createAccessToken = async (user: User): Promise<string> => {
  const payload = Object.assign({}, user);

  // Delete sensitive data from User object
  delete payload["password"];
  delete payload["lastUpdated"];
  delete payload["createdAt"];
  delete payload["resetToken"];
  delete payload["count"];

  const accessToken = await sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: ACCESS_TOKEN_EXPIRATION_LENGTH
    }
  );

  return accessToken;
};

export const createRefreshToken = async (user: User): Promise<string> => {
  const payload = Object.assign({}, user);

  // Delete sensitive data from User object
  delete payload["password"];
  delete payload["lastUpdated"];
  delete payload["createdAt"];
  delete payload["resetToken"];

  const refreshToken = await sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: REFRESH_TOKEN_EXPIRATION_LENGTH
    }
  );

  return refreshToken;
};

export const createResetToken = async (
  email: string
): Promise<{
  code: string;
  resetToken: string;
}> => {
  // Generate random 6 digit code
  const code = randomize("0", 6);

  console.log(code);

  const resetToken = await sign(
    { code, email },
    process.env.RESET_TOKEN_SECRET as string,
    {
      expiresIn: RESET_TOKEN_EXPIRATION_LENGTH
    }
  );

  return { code, resetToken };
};
