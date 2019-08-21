const express = require("express");

const userRouter = require("./router");

const cors = require("cors");

const session = require("express-session");

const bodyParser = require("body-parser");

const app=express();

app.listen(1994);	//监听端口

app.use(bodyParser.urlencoded({
	extended:false
}));

app.use(cors({
    origin:["http://localhost:8080","http://127.0.0.1:8080"],
    credentials:true,
}));

app.use(session({
    secret:"128为字符串",
    resave:true,
    saveUninitialized:true,
}));

app.use(express.static("public"));
app.use(userRouter);