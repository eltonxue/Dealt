import { NextFunction } from "express";
import { MiddlewareFn } from "type-graphql";
import { verify } from "jsonwebtoken";
import { ApolloError } from "apollo-server-core";

import { User } from "../entities";
import { createAccessToken } from "../helpers/jwt";

import { Context } from "../types/express";

// TODO: Implement middleware for handling accessTokens and refreshTokens
// See: https://www.youtube.com/watch?v=zbp8LZXBUYc

// Authenticates access token and refresh token passed as cookies
export const requireLogin: MiddlewareFn<Context> = async (
  { context: { req, res } },
  next: NextFunction
) => {
  console.log("running 'requireLogin' middleware...");
  const { accessToken, refreshToken } = req.cookies;

  // If neither tokens exist, we want throw an unauthorized error
  if (!accessToken || !refreshToken) {
    throw new ApolloError("Unauthorized");
  }

  const decodedAccessToken: User = (await verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET as string
  )) as User;

  // Access token is valid, continue with request
  if (decodedAccessToken) {
    // MAYBE: We might need to fetch the user from the database for attaching
    req.user = decodedAccessToken;
    return next();
  }

  const decodedRefreshToken: User = (await verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as string
  )) as User;

  // Refresh token is valid, continue with authentication
  if (decodedRefreshToken) {
    const user = await User.findOne({ id: decodedRefreshToken.id });

    if (!user) {
      throw new ApolloError("User not found");
    }

    /**
     * Refresh token has not been invalidated in the database.
     * Therefore, we generate a new access token and continue with the request
     */
    if (decodedRefreshToken.count === user.count) {
      const newAccessToken = await createAccessToken(user);

      // Setting new access token as cookie
      res.cookie("accessToken", newAccessToken);

      const decodedNewAccessToken: User = (await verify(
        newAccessToken,
        process.env.ACCESS_TOKEN_SECRET as string
      )) as User;

      req.user = decodedNewAccessToken;
      return next();
    }
  }
  /**
   * If we've reached this point, the access token and refresh token were invalidated.
   * Therefore, we should throw an unauthorized error.
   */
  throw new ApolloError("Unauthorized");
};
