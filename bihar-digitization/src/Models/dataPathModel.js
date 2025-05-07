const Sequelize = require("sequelize");

const sequelize = require("../utils/database");
const PdfModel = sequelize.define("datapaths", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  pdf_Path: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  image_Path: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = PdfModel;
