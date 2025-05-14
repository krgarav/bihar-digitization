const Sequelize = require("sequelize");
const path = require("path");
const { app } = require("electron");
// Get a safe path to store user data
const dbPath = path.join(app.getPath("userData"), "database.sqlite");
// SQLite database connection
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false,
});

module.exports = sequelize;
