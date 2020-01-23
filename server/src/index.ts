import "reflect-metadata";

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createConnection, getConnectionOptions } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { GraphQLSchema } from "graphql";
import { buildSchema } from "type-graphql";

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
    context: ({ req, res }) => ({ req, res })
  });

  const app = express();
  server.applyMiddleware({ app });

  app.listen(PORT, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();
