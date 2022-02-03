require("dotenv").config();

//dependencies
const cron = require("node-cron");
const express = require("express");
const cors = require("cors");

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const morgan = require("morgan");
const mongoose = require("mongoose");

// init express app
const app = express();

//Get Mongo connection URI from env var
const DB_URL = process.env.MONGO_URI;

// Config variables
const ENABLE_FETCH_JOB = process.env.ENABLE_FETCH_JOB || true; //set false to disable API fetch script

//Connect mongoose
mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Databse Connected!");
  });

// Swagger config
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: "1.0.0",
      title: "Fampay API",
      description: "Fampay API Visual Information",
    },
  },
  apis: ["routes/main.js"],
};

//setup Swagger for auto documentation
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// set the view engine to ejs
app.set("view engine", "ejs");

//Import Routes
const apiRoutes = require("./routes/main");

//Import scripts
const { fetchAndSaveData } = require("./fetch");

//Express options
app.use(morgan(process.env.NODE_ENV == "production" ? "common" : "dev"));
app.use(express.json());

//CORS
app.use(cors());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//Express Routes
app.use("/", apiRoutes);

//Schedulers
if (process.env.NODE_ENV === "production") {
  //Fetch new videos every 5 minutes.
  cron.schedule("*/5 * * * *", async () => {
    if (ENABLE_FETCH_JOB) {
      console.log("\nFetching Video Meta Data...");
      fetchAndSaveData();
    }
  });
}

//Start Expres Server
const PORT = process.env.PORT || 4002;
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server Ready!");
});
