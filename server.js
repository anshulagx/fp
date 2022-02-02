require("dotenv").config();

//dependencies
const cron = require("node-cron");
const express = require("express");
const cors = require("cors");
const app = express();

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const morgan = require("morgan");
const mongoose = require("mongoose");

//Get Mongo connection URI from env var
const DB_URL = process.env.MONGO_URI;

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
  // ['.routes/*.js']
  apis: ["routes/main.js"],
};

//setup Swagger for auto documentation
const swaggerDocs = swaggerJsDoc(swaggerOptions);

//Import Routes
const apiRoutes = require("./routes/main");

//Import scripts
const { fetchAndSaveData } = require("./fetch");

//Express options
app.use(morgan(process.env.NODE_ENV == "production" ? "common" : "dev"));
app.use(express.json());

//CORS
app.use(cors());
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   next();
// });

//Express Routes
app.use("/api", apiRoutes);

app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//Schedulers
if (process.env.NODE_ENV === "production") {
  //Fetch new tweets every 1 minutes.
  cron.schedule("*/1 * * * *", async () => {
    console.log("\nFetching Video Meta Data...");
    fetchAndSaveData();
  });
}

//Start Expres Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server Ready!");
});
