import { Entity, Column } from "typeorm";
import { Field, ObjectType, ID } from "type-graphql";

import BaseEntity from "./Base";

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Field()
  @Column("text", { unique: true })
  email!: string;

  @Field()
  @Column()
  password!: string;

  @Field()
  @Column("text", { unique: true })
  username!: string;

  @Field()
  @Column("integer", { default: 0 })
  count!: number;
}
