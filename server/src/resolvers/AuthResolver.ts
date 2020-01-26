import {
  Resolver,
  Mutation,
  Arg,
  Query,
  Ctx,
  UseMiddleware
} from "type-graphql";
import { ApolloError } from "apollo-server-express";
import { hash, verify } from "argon2";

import { User } from "../entities";

import { createAccessToken, createRefreshToken } from "../helpers/jwt";
import { requireLogin } from "../middlewares/requireLogin";

import { RegisterInput, LoginInput, AuthResponse } from "../types/auth";
import { Context } from "../types/express";
import { UserResponse } from "../types/user";

// TODO: Implement accessTokens and refreshTokens
// See: https://www.youtube.com/watch?v=zbp8LZXBUYc

const INVALID_LOGIN_ERROR = {
  errors: [
    {
      path: "email",
      message: "incorrect email or password"
    }
  ]
};

const USERNAME_EXISTS_ERROR = {
  errors: [
    {
      path: "username",
      message: "username already exists"
    }
  ]
};

const EMAIL_EXISTS_ERROR = {
  errors: [
    {
      path: "email",
      message: "email already exists"
    }
  ]
};

@Resolver()
export default class AuthResolver {
  @Query(() => UserResponse)
  @UseMiddleware(requireLogin)
  async me(@Ctx() { req, res }: Context): Promise<UserResponse> {
    const user = await User.findOne({ id: req.user.id });
    return { user };
  }

  @Mutation(() => AuthResponse)
  async register(
    @Ctx() { req, res }: Context,
    @Arg("input") { email, username, password }: RegisterInput
  ): Promise<AuthResponse> {
    try {
      const hashedPassword = await hash(password);

      const existingEmail = await User.findOne({ email });
      const existingUsername = await User.findOne({ username });

      if (existingEmail) {
        return EMAIL_EXISTS_ERROR;
      }
      if (existingUsername) {
        return USERNAME_EXISTS_ERROR;
      }

      const user = await User.create({
        email,
        username,
        password: hashedPassword
      }).save();

      const accessToken = await createAccessToken(user);
      const refreshToken = await createRefreshToken(user);

      const options = {
        secure: process.env.NODE_ENV === "production",
        httpOnly: false
      };

      // Set access token and refresh token as cookies
      res.cookie("accessToken", accessToken, options);
      res.cookie("refreshToken", refreshToken, options);

      return { success: true };
    } catch (err) {
      // TODO: Transactions ?
      throw new ApolloError(`Internal Failure - ${err}`);
    }
  }

  @Mutation(() => AuthResponse)
  async login(
    @Ctx() { req, res }: Context,
    @Arg("input") { email, password }: LoginInput
  ): Promise<AuthResponse> {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return INVALID_LOGIN_ERROR;
      }

      const valid = await verify(user.password, password);

      if (!valid) {
        return INVALID_LOGIN_ERROR;
      }

      const accessToken = await createAccessToken(user);
      const refreshToken = await createRefreshToken(user);

      // Set access token and refresh token as cookies
      const options = {
        secure: process.env.NODE_ENV === "production",
        httpOnly: false
      };

      res.cookie("accessToken", accessToken, options);
      res.cookie("refreshToken", refreshToken, options);

      return { success: true };
    } catch (err) {
      throw new ApolloError(`Internal Failure - ${err}`);
    }
  }

  // TODO: Logout feature
  // @Mutation(() => Boolean)
  // async logout(): Promise<Boolean> {
  //   return;
  // }
}
