import { Resolver, Mutation, Arg, Query, Ctx } from "type-graphql";
import { hash, compare } from "bcrypt";

import { User } from "../entities";
import { RegisterInput, LoginInput, AuthResponse } from "../types/auth";
import { Context } from "../types/express";
import { UserResponse } from "../types/user";
import { createTokens } from "../helpers/jwt";

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
  async me(@Ctx() { req, res }: Context): Promise<UserResponse> {
    const user = await User.findOne({ email: "eltonxue@gmail.com" });

    return { user };
  }

  @Mutation(() => AuthResponse)
  async register(
    @Ctx() { req, res }: Context,
    @Arg("input") { email, username, password }: RegisterInput
  ): Promise<AuthResponse> {
    const hashedPassword = await hash(password, 12);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return EMAIL_EXISTS_ERROR;
    }

    const user = await User.create({
      email,
      username,
      password: hashedPassword
    }).save();

    const { accessToken, refreshToken } = await createTokens(user);

    // TODO: Set cookies given accessToken and refreshToken

    return { success: true };
  }

  @Mutation(() => AuthResponse)
  async login(
    @Ctx() { req, res }: Context,
    @Arg("input") { email, password }: LoginInput
  ): Promise<AuthResponse> {
    const user = await User.findOne({ email });

    if (!user) {
      return INVALID_LOGIN_ERROR;
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      return INVALID_LOGIN_ERROR;
    }

    const { accessToken, refreshToken } = await createTokens(user);

    // TODO: Set cookies given accessToken and refreshToken

    return { success: true };

    // TODO: Logout feature
    // @Mutation(() => Boolean)
    // async logout(): Promise<Boolean> {
    //   return;
    // }
  }
}
