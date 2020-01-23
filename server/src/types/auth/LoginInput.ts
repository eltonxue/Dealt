import { InputType, Field } from "type-graphql";

@InputType()
export default class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}
