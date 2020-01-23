import { Field, ObjectType } from "type-graphql";

@ObjectType()
export default class FieldError {
  @Field()
  path!: string;

  @Field()
  message!: string;
}
