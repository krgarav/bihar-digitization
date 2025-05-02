const express = require("express");
const app = express();
const cors = require("cors");
const processRoute = require("./Routes/processpdf");
app.use(express.json());
app.use(cors("*"));

app.use(processRoute);
// Database Sync and Admin User Creation (Handled in Electron Main)
const startServer = async () => {};

// Export app and startServer function
module.exports = { app, startServer };
