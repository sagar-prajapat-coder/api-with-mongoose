const express = require('express');
require('./config');
const users = require('./Model/user');

const app = express();

app.use(express.json());
app.post("/create-user",async (req,resp) =>{
    let data = users(req.body);
    let result = await data.save();
    console.log(result);
        resp.send(result);
});

app.listen(5000);