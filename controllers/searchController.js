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
exports.dashboardController = async (req, res) => {
  try {
    const q = req.query.q;
    const search_cat = req.query.search_cat || "both";
    const perPage = Number(req.query.perPage) || 5;
    const sort_order = Number(req.query.sort_order) || -1;
    const sort_cat = req.query.sort_cat || "date";

    const pageNo = Number(req.query.pageNo) || 1;
    const offset = Number(req.query.offset) || 0;

    const query = [];

    q
      ? query.push({
          $search: {
            index: "default",
            text: {
              query: q,
              path:
                search_cat === "both"
                  ? {
                      wildcard: "*",
                    }
                  : search_cat,
            },
          },
        })
      : {};
    if (sort_cat === "date") query.push({ $sort: { publishedAt: sort_order } });
    else if (sort_cat === "title") query.push({ $sort: { title: sort_order } });
    else if (sort_cat === "description")
      query.push({ $sort: { description: sort_order } });

    query.push({ $skip: (pageNo - 1) * perPage + offset });

    query.push({ $limit: perPage });
    const data = await VideoSchema.aggregate(query);

    // console.log("data", data);
    res.render("index", { data });
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
};
