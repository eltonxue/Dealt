import { NextFunction } from "express";
import { MiddlewareFn } from "type-graphql";
import { verify } from "jsonwebtoken";
import { ApolloError } from "apollo-server-core";

import { User } from "../entities";
import { createTokens } from "../helpers/jwt";

import { Context } from "../types/express";

// TODO: Implement middleware for handling accessTokens and refreshTokens
// See: https://www.youtube.com/watch?v=zbp8LZXBUYc

export const requireLogin: MiddlewareFn<Context> = async (
  { context },
  next: NextFunction
) => {
  console.log("running jwt middlware");
  const accessToken = context.req.headers["x-access-token"] as string;
  const refreshToken = context.req.headers["x-refresh-token"] as string;

  console.log(accessToken);
  console.log(refreshToken);

  // If neither tokens exist, we want to skip this middleware
  if (!accessToken && !refreshToken) {
    throw new ApolloError("Unauthorized");
  }

  // If accessToken decoded accessToken, we want to attach the user to the request object

  const decodedAccessToken: User = (await verify(
    accessToken,
    "accessToken"
  )) as User;

  if (decodedAccessToken) {
    context.req.user = decodedAccessToken;
    return next();
  }

  const decodedRefreshToken: User = (await verify(
    refreshToken,
    "refreshToken"
  )) as User;

  if (decodedRefreshToken) {
    const user = await User.findOne({ id: decodedRefreshToken.id });

    if (!user) {
      return next();
    }

    context.req.user = decodedRefreshToken;

    // Create new tokens
    const userTokens = await createTokens(user);
    context.res.set({
      "Access-Control-Expose-Headers": "x-access-token,x-refresh-token",
      "x-access-token": userTokens.accessToken,
      "x-refresh-token": userTokens.refreshToken
    });
    return next();
  }

  console.log("no tokens passed");

  return next();
};
