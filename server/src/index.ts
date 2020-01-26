import "reflect-metadata";

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import sgMail from "@sendgrid/mail";
import { createConnection, getConnectionOptions } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { GraphQLSchema } from "graphql";
import { buildSchema } from "type-graphql";

import { Context } from "./types/express";
import resolvers from "./resolvers";

const PORT: String | Number = process.env.PORT || 4000;

const startServer = async () => {
  const schema: GraphQLSchema = await buildSchema({ resolvers });

  // get options from ormconfig.js
  const dbOptions = await getConnectionOptions(
    process.env.NODE_ENV || "development"
  );

  await createConnection({ ...dbOptions, name: "default" });

  const server: ApolloServer = new ApolloServer({
    schema,
    context: async ({ req, res }: Context) => {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
      return { req, res };
    }
  });

  const app = express();
  app.use(
    cors({
      credentials: true,
      origin: process.env.CLIENT_DOMAIN
    })
  );
  app.use(cookieParser());
  server.applyMiddleware({ app });

  app.listen(PORT, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();
