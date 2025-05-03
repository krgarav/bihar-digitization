const Sequelize = require("sequelize");

const sequelize = require("../utils/database");
const PdfFileModel = sequelize.define("pdfimage", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  file_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = PdfFileModel;
