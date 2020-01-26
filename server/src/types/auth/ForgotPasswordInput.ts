import { InputType, Field } from "type-graphql";

@InputType()
export default class ForgotPasswordInput {
  @Field()
  email!: string;
}
