import { InputType, Field } from "type-graphql";

@InputType()
export default class UpdatePasswordInput {
  @Field()
  password!: string;
}
