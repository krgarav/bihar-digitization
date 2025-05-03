const Sequelize = require("sequelize");

// SQLite database connection
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite", // or another path like ':memory:' for in-memory DB
  logging: false,
});

module.exports = sequelize;
