import { sign } from "jsonwebtoken";

import { User } from "../entities";

const ACCESS_TOKEN_EXPIRATION_LENGTH = 60 * 60; // Expires in 1 hour
const REFRESH_TOKEN_EXPIRATION_LENGTH = 60 * 60 * 24 * 30 * 12; // Expires in 1 year

export const createTokens = async (user: User) => {
  const payload = Object.assign({}, user);
  const accessToken = await sign(payload, "accessToken", {
    expiresIn: ACCESS_TOKEN_EXPIRATION_LENGTH
  });
  const refreshToken = await sign(payload, "refreshToken", {
    expiresIn: REFRESH_TOKEN_EXPIRATION_LENGTH
  });

  return { accessToken, refreshToken };
};
