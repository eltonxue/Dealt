import { ObjectType, Field } from "type-graphql";

import { User } from "../../entities";

import { FieldError } from "../error";

@ObjectType()
export default class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
