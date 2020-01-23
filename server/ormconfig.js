module.exports = [
  {
    name: "development",
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "spotifycloud",
    password: "password",
    database: "spotifycloud",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: false,
    entities: ["src/entities/**/*.ts"],
    migrations: ["src/migrations/**/*.ts"],
    subscribers: ["src/subscribers/**/*.ts"],
    cli: {
      entitiesDir: "src/entities",
      migrationsDir: "src/migrations",
      subscribersDir: "src/subscribers"
    }
  },
  {
    name: "production",
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "spotifycloud",
    password: "password",
    database: "spotifycloud",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: false,
    entities: ["src/entities/**/*.ts"],
    migrations: ["src/migrations/**/*.ts"],
    subscribers: ["src/subscribers/**/*.ts"],
    cli: {
      entitiesDir: "src/entities",
      migrationsDir: "src/migrations",
      subscribersDir: "src/subscribers"
    }
  }
];
