import express from "express";
import config from "./config.js";
import router from "./Routes/routes.js";

const app = express();


app.use(express.json()); 
app.use("/api", router); 

app.listen(5000);