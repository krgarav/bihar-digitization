const Sequelize = require("sequelize");

const sequelize = require("../utils/database");
const PdfModel = sequelize.define("pdfs", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  pdf_Name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = PdfModel;
