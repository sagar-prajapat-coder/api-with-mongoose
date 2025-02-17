const express = require("express");
require("./config");
const userRoutes = require("./Routes/routes");

const app = express();

app.use(express.json()); // Middleware to parse JSON
app.use("/api", userRoutes); // Prefix API routes


app.listen(5000);