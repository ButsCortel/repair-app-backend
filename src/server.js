const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes");
const path = require("path");
const http = require("http");
const PORT = process.env.PORT || 8000;

const app = express();
const server = http.Server(app);

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

try {
    mongoose.connect(process.env.MONGO_DB_SECRET_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true, //config for connecting to mdb
        useFindAndModify: false
    });
    console.log("MongoDB connected Successfully");
} catch (error) {
    throw Error(`Error while while connecting to DB: ${error}`);
}

app.use(cors());

app.use(express.json());

app.use(routes);
server.listen(PORT, () => console.log(`Listening to Port: ${PORT}`))