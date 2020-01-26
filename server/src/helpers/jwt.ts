import { sign } from "jsonwebtoken";

import { User } from "../entities";

const ACCESS_TOKEN_EXPIRATION_LENGTH = 60 * 60; // Expires in 1 hour
const REFRESH_TOKEN_EXPIRATION_LENGTH = 60 * 60 * 24 * 30 * 12; // Expires in 1 year

export const createAccessToken = async (user: User) => {
  const payload = Object.assign({}, user);

  // Delete sensitive data from User object
  delete payload["password"];
  delete payload["lastUpdated"];
  delete payload["createdAt"];
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

export const createRefreshToken = async (user: User) => {
  const payload = Object.assign({}, user);

  // Delete sensitive data from User object
  delete payload["password"];
  delete payload["lastUpdated"];
  delete payload["createdAt"];

  const refreshToken = await sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: REFRESH_TOKEN_EXPIRATION_LENGTH
    }
  );

  return refreshToken;
};
