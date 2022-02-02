const VideoSchema = require("../models/Video.schema");
exports.searchController = async (req, res) => {
  try {
    const { q } = req.query;

    const query = [];

    query.push({
      $search: {
        index: "default",
        text: {
          query: q,
          path: {
            wildcard: "*",
          },
        },
      },
    });
    query.push({ $limit: 100 });

    const data = await VideoSchema.aggregate(query);

    // console.log("data", data);
    res.send({ title: data[0].title, desc: data[0].description });
  } catch (err) {
    console.log(err);
    res.send("err");
  }
};

exports.allController = async (req, res) => {
  try {
    const _pageNo = req.query.pageNo || 0;
    const _offset = req.query.offset || 0;
    const _limit = req.query.limit || 5;

    const skip = parseInt(_pageNo) * parseInt(_limit) + parseInt(_offset);
    const limit = parseInt(_limit);
    if (limit > 50) throw new Error("max limit is 50");

    const data = await VideoSchema.find()
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit); // set max limit to 50
    // console.log("data", data);
    res.send(data.map(({ title }) => title));
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
};
