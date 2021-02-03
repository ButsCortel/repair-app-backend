const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes");

const PORT = process.env.PORT || 8000;

const app = express();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

try {
  mongoose.connect(process.env.MONGO_DB_SECRET_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true, //config for connecting to mdb
    useFindAndModify: false,
  });
  console.log("MongoDB connected Successfully");
} catch (error) {
  throw Error(`Error while while connecting to DB: ${error}`);
}

app.use(cors());

app.use(express.json());

app.use(routes);
app.listen(PORT, () => console.log(`Listening to Port: ${PORT}`));
