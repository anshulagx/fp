// import mongoose Video schema
const VideoSchema = require("../models/Video.schema");

// import fetch to make the API calls
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// defining constants
const MAX_RESULTS = 50; // The max no of videos to get in a single API call. UPPER LIMIT:50
const last_n_mins = 45; // Fetch all the videos posted in last_n_minutes
const query = "india"; // The API search query

const NO_OF_API_KEYS = process.env.GOOGLE_API_KEY.split(",").length; // The no of API keys add in .env seperated by ,
console.log(NO_OF_API_KEYS, " API keys identified");

var api_key_counter = 0; // The index of API key to use in the current cycle

const fetchSearchResults = async (query, timestamp) => {
  var API_KEY = process.env.GOOGLE_API_KEY.split(",")[api_key_counter];
  console.log("Trying to fetch with API key index:", api_key_counter + 1);
  const url = `https://youtube.googleapis.com/youtube/v3/search?maxResults=${MAX_RESULTS}&part=snippet&order=date&publishedAfter=${timestamp}&q=${query}&type=video&key=${API_KEY}`;
  try {
    const response = await fetch(url, {
      method: "GET",
    }).then((res) => res.json());

    return response;
  } catch (error) {
    console.error(error);
    return {};
  }
};

const fetchAndSaveData = async () => {
  // current DATE_TIME - n minutes
  const date = new Date(
    new Date().setMinutes(new Date().getMinutes() - last_n_mins)
  )
    .toISOString()
    .toString();

  console.log(
    `Trying to fetch ${MAX_RESULTS} videos posted after ${date} from YT API`
  );
  //Get the API response based on the search query and the time after which the video was published
  const data = await fetchSearchResults(query, date);

  // If the response suggest any error or API key quota is over, then change the API key
  if (data.error) {
    api_key_counter = (api_key_counter + 1) % NO_OF_API_KEYS; // increment API key index in a round robin approach
    console.log("❌ API Key quota exceded! Will retry with next API key.");
    return; // end the cron job for the current cycle.
  }

  // create a JSON object from the API response
  const dataStripped = data.items.map(({ id, snippet }) => {
    return {
      id: id.videoId,
      publishedAt: snippet.publishedAt,
      title: snippet.title,
      description: snippet.description,
      default_thumb: snippet.thumbnails.default.url,
      medium_thumb: snippet.thumbnails.medium.url,
      high_thumb: snippet.thumbnails.high.url,
    };
  });

  // The DB query builder array
  var ops = [];

  // Use bulkWrite to write all the documents to the DB in a single network call.
  // Using the upsert operation to update the document if the video already exist else write it. This will prevent data duplication.
  dataStripped.forEach((e) => {
    ops.push({
      updateOne: {
        filter: { id: e.id },
        update: {
          $setOnInsert: { ...e },
        },
        upsert: true,
      },
    });
  });

  // Make a DB write
  const res = await VideoSchema.bulkWrite(ops, { ordered: false });
  console.log("Count of docs written to the database:", res.nUpserted);
};

module.exports = { fetchAndSaveData };
