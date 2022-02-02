const VideoSchema = require("./models/Video.schema");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const MAX_RESULTS = 50; // max could be 50 as per API constraints
const last_n_mins = 45; // fetch all the videos posted in last_n_minutes
const query = "india";

const NO_OF_API_KEYS = process.env.GOOGLE_API_KEY.split(",").length;
console.log(NO_OF_API_KEYS, " API keys identified");
var api_key_counter = 0;
const fetchSearchResults = async (query, timestamp) => {
  var API_KEY = process.env.GOOGLE_API_KEY.split(",")[api_key_counter];
  console.log("Trying to fetch with API key ", api_key_counter + 1);
  const url = `https://youtube.googleapis.com/youtube/v3/search?maxResults=${MAX_RESULTS}&part=snippet&order=date&publishedAfter=${timestamp}&q=${query}&type=video&key=${API_KEY}`;
  console.log("Query URL:", url);
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
  console.log("************************************************");
  const date = new Date(
    new Date().setMinutes(new Date().getMinutes() - last_n_mins)
  )
    .toISOString()
    .toString();
  console.log(
    `Trying to fetch ${MAX_RESULTS} videos posted after ${date} from YT API`
  );
  var data = await fetchSearchResults(query, date);
  if (data.error) {
    //API quota pass
    api_key_counter = (api_key_counter + 1) % NO_OF_API_KEYS;
    console.log("❌ API Key quota exceded");
    return;
  }
  console.log("Total Results:", data.pageInfo.totalResults);
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

  console.log("Saving to the database");

  var ops = [];

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

  const res = await VideoSchema.bulkWrite(ops, { ordered: false });

  console.log("Database response", res);
};

module.exports = { fetchAndSaveData };
