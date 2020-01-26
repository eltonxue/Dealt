import { ObjectType, Field } from "type-graphql";

import { FieldError } from "../error";

@ObjectType()
export default class SuccessResponse {
  @Field({ nullable: true })
  success?: boolean;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
