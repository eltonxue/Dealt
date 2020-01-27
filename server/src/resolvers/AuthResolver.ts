import {
  Resolver,
  Mutation,
  Arg,
  Query,
  Ctx,
  UseMiddleware
} from "type-graphql";
import { getManager } from "typeorm";
import { ApolloError } from "apollo-server-express";
import { verify } from "jsonwebtoken";
import argon2 from "argon2";
import sgMail from "@sendgrid/mail";

import { User } from "../entities";

import {
  createAccessToken,
  createRefreshToken,
  createResetToken
} from "../helpers/jwt";
import { requireLogin } from "../middlewares/requireLogin";

import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdatePasswordInput,
  AuthResponse
} from "../types/auth";
import { Context } from "../types/express";
import { UserResponse } from "../types/user";
import {
  INVALID_LOGIN_ERROR,
  USERNAME_EXISTS_ERROR,
  EMAIL_EXISTS_ERROR,
  EMAIL_DOES_NOT_EXIST_ERROR,
  INVALID_CODE_ERROR,
  INVALID_RESET_TOKEN_ERROR
} from "../errors/auth";

// TODO: Implement accessTokens and refreshTokens
// See: https://www.youtube.com/watch?v=zbp8LZXBUYc

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
      const existingEmail = await User.findOne({ email });
      const existingUsername = await User.findOne({ username });

      if (existingEmail) {
        return EMAIL_EXISTS_ERROR;
      }
      if (existingUsername) {
        return USERNAME_EXISTS_ERROR;
      }

      await getManager().transaction(async transaction => {
        const hashedPassword = await argon2.hash(password);

        const user = await transaction.create(User, {
          email,
          username,
          password: hashedPassword
        });

        const accessToken = await createAccessToken(user);
        const refreshToken = await createRefreshToken(user);

        const options = {
          secure: process.env.NODE_ENV === "production",
          httpOnly: false
        };

        // Set access token and refresh token as cookies
        res.cookie("accessToken", accessToken, options);
        res.cookie("refreshToken", refreshToken, options);

        // throw new ApolloError("TADAAAAAAAAA");
      });

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

      const valid = await argon2.verify(user.password, password);

      if (!valid) {
        return INVALID_LOGIN_ERROR;
      }

      const accessToken = await createAccessToken(user);
      const refreshToken = await createRefreshToken(user);

      // Set access token and refresh token as cookies
      const options = {
        secure: process.env.NODE_ENV === "production",
        httpOnly: false,
        maxAge: 60 * 60 // Expires in 1 hour
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

  @Mutation(() => AuthResponse)
  async forgotPassword(
    @Arg("input") { email }: ForgotPasswordInput
  ): Promise<AuthResponse> {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return EMAIL_DOES_NOT_EXIST_ERROR;
      }

      const { code, resetToken } = await createResetToken(email);

      await getManager().transaction(async transaction => {
        await transaction.update(User, { email }, { resetToken });

        const message = {
          to: email,
          from: "dealt@gmail.com",
          subject: "Reset Password Request",
          html: `<b>Your reset password code is ${code}</b>`
        };

        await sgMail.send(message);
      });

      return { success: true };
    } catch (err) {
      throw new ApolloError(`Internal Failure - ${err}`);
    }
  }

  @Mutation(() => AuthResponse)
  async resetPassword(
    @Ctx() { req, res }: Context,
    @Arg("input") { email, code }: ResetPasswordInput
  ): Promise<AuthResponse> {
    try {
      if (!code) {
        return INVALID_CODE_ERROR;
      }

      const user = await User.findOne({ email });

      if (!user) {
        return EMAIL_DOES_NOT_EXIST_ERROR;
      }

      if (!user.resetToken) {
        return INVALID_CODE_ERROR;
      }

      const decodedResetToken: { code: string; email: string } = (await verify(
        user.resetToken,
        process.env.RESET_TOKEN_SECRET as string
      )) as { code: string; email: string };

      if (decodedResetToken.code !== code) {
        return INVALID_CODE_ERROR;
      }

      const options = {
        secure: process.env.NODE_ENV === "production",
        httpOnly: false
      };

      res.cookie("resetToken", user.resetToken, options);

      return { success: true };
    } catch (err) {
      throw new ApolloError(`Internal Failure - ${err}`);
    }
  }

  @Mutation(() => AuthResponse)
  async updatePassword(
    @Ctx() { req, res }: Context,
    @Arg("input") { password }: UpdatePasswordInput
  ): Promise<AuthResponse> {
    try {
      const { resetToken } = req.cookies;

      if (!resetToken) {
        return INVALID_RESET_TOKEN_ERROR;
      }

      const decodedResetToken: { code: string; email: string } = (await verify(
        resetToken,
        process.env.RESET_TOKEN_SECRET as string
      )) as { code: string; email: string };

      const { email } = decodedResetToken;

      const user = await User.findOne({ email });

      if (!user) {
        return INVALID_RESET_TOKEN_ERROR;
      }

      if (resetToken !== user.resetToken) {
        return INVALID_RESET_TOKEN_ERROR;
      }

      await getManager().transaction(async transaction => {
        const hashedPassword = await argon2.hash(password);

        await transaction.update(
          User,
          { email },
          {
            password: hashedPassword,
            resetToken: undefined,
            count: ++user.count
          }
        );
      });

      return { success: true };
    } catch (err) {
      throw new ApolloError(`Internal Failure - ${err}`);
    }
  }
}
