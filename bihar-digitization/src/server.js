const express = require("express");
const app = express();
const cors = require("cors");
const processRoute = require("./Routes/processpdf");
const PdfModel = require("./Models/pdfModel");
const PdfFileModel = require("./Models/pdfFileModel");
const sequelize = require("./utils/database");
app.use(express.json());
app.use(cors("*"));

app.use(processRoute);

PdfModel.hasMany(PdfFileModel, {
  foreignKey: "pdfId",
  as: "files", // optional alias
});

PdfFileModel.belongsTo(PdfModel, {
  foreignKey: "pdfId",
});
// Database Sync and Admin User Creation (Handled in Electron Main)
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    await sequelize.sync({ force: false }); // or { force: true } to drop & recreate tables
    console.log("📦 Models synchronized with database.");

    // Optional: seed admin user or other initial data here
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};

// Export app and startServer function
module.exports = { app, startServer };
