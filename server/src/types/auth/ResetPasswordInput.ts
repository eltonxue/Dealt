import { InputType, Field } from "type-graphql";

@InputType()
export default class ResetPasswordInput {
  @Field()
  email!: string;

  @Field()
  code!: string;
}
